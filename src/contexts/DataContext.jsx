import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  collection, doc, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, setDoc, getDocs, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

const DEFAULT_ACCOUNTS = [
  { name: '生活費', color: '#3E5C7A', order: 0 },
  { name: '娯楽・お小遣い', color: '#B8863B', order: 1 },
  { name: '貯金', color: '#3E7A5C', order: 2 }
]

const DEFAULT_CATEGORIES = [
  { name: '食費', type: 'expense', order: 0 },
  { name: '日用品', type: 'expense', order: 1 },
  { name: '交通', type: 'expense', order: 2 },
  { name: '娯楽', type: 'expense', order: 3 },
  { name: '住居', type: 'expense', order: 4 },
  { name: '医療', type: 'expense', order: 5 },
  { name: '美容', type: 'expense', order: 6 },
  { name: 'その他', type: 'expense', order: 7 },
  { name: '給与', type: 'income', order: 0 },
  { name: '副業', type: 'income', order: 1 },
  { name: 'お小遣い', type: 'income', order: 2 },
  { name: 'その他', type: 'income', order: 3 }
]

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) {
      setAccounts([]); setCategories([]); setTransactions([]); setReady(false)
      return
    }

    let unsubs = []

    async function bootstrap() {
      const accountsCol = collection(db, 'users', user.uid, 'accounts')
      const categoriesCol = collection(db, 'users', user.uid, 'categories')

      // 初回ログイン時にデフォルトの口座・カテゴリを作成する
      const existingAccounts = await getDocs(accountsCol)
      if (existingAccounts.empty) {
        for (const a of DEFAULT_ACCOUNTS) {
          await addDoc(accountsCol, { ...a, createdAt: serverTimestamp() })
        }
      }
      const existingCategories = await getDocs(categoriesCol)
      if (existingCategories.empty) {
        for (const c of DEFAULT_CATEGORIES) {
          await addDoc(categoriesCol, { ...c, createdAt: serverTimestamp() })
        }
      }

      unsubs.push(onSnapshot(query(accountsCol, orderBy('order', 'asc')), (snap) => {
        setAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }))
      unsubs.push(onSnapshot(query(categoriesCol, orderBy('order', 'asc')), (snap) => {
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }))
      const txCol = collection(db, 'users', user.uid, 'transactions')
      unsubs.push(onSnapshot(query(txCol, orderBy('date', 'desc'), orderBy('createdAt', 'desc')), (snap) => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }))
      setReady(true)
    }

    bootstrap()
    return () => unsubs.forEach(u => u())
  }, [user])

  const api = useMemo(() => {
    if (!user) return null
    const uid = user.uid
    return {
      addAccount: (data) => addDoc(collection(db, 'users', uid, 'accounts'), {
        ...data, order: accounts.length, createdAt: serverTimestamp()
      }),
      updateAccount: (id, data) => updateDoc(doc(db, 'users', uid, 'accounts', id), data),
      deleteAccount: (id) => deleteDoc(doc(db, 'users', uid, 'accounts', id)),
      addCategory: (data) => addDoc(collection(db, 'users', uid, 'categories'), {
        ...data, order: categories.filter(c => c.type === data.type).length, createdAt: serverTimestamp()
      }),
      addTransaction: (data) => addDoc(collection(db, 'users', uid, 'transactions'), {
        ...data, createdAt: serverTimestamp()
      }),
      updateTransaction: (id, data) => updateDoc(doc(db, 'users', uid, 'transactions', id), data),
      deleteTransaction: (id) => deleteDoc(doc(db, 'users', uid, 'transactions', id))
    }
  }, [user, accounts, categories])

  return (
    <DataContext.Provider value={{ accounts, categories, transactions, ready, ...api }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
