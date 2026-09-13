import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  collection, doc, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, setDoc, getDoc, serverTimestamp, arrayUnion
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { todayStr } from '../utils/format'

const DataContext = createContext(null)

const DEFAULT_SETTINGS = {
  monthlyResetEnabled: true,
  monthlyLimitEnabled: true
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [userDoc, setUserDoc] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) {
      setAccounts([]); setCategories([]); setTransactions([]); setUserDoc(null); setReady(false)
      return
    }

    let unsubs = []

    async function bootstrap() {
      const userRef = doc(db, 'users', user.uid)
      const existing = await getDoc(userRef)
      if (!existing.exists()) {
        await setDoc(userRef, {
          tutorialSeenVersion: 0,
          settings: DEFAULT_SETTINGS,
          createdAt: serverTimestamp()
        })
      }

      unsubs.push(onSnapshot(userRef, (snap) => {
        setUserDoc(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      }))

      const accountsCol = collection(db, 'users', user.uid, 'accounts')
      const categoriesCol = collection(db, 'users', user.uid, 'categories')
      const txCol = collection(db, 'users', user.uid, 'transactions')

      // 口座・カテゴリは自動作成しない。空の状態はチュートリアルで作ってもらう。
      unsubs.push(onSnapshot(query(accountsCol, orderBy('order', 'asc')), (snap) => {
        setAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }))
      unsubs.push(onSnapshot(query(categoriesCol, orderBy('order', 'asc')), (snap) => {
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }))
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
        monthlyResetEnabled: false,
        resetBaseline: null,
        resetHistory: [],
        monthlyLimit: null,
        ...data,
        order: accounts.length,
        createdAt: serverTimestamp()
      }),
      updateAccount: (id, data) => updateDoc(doc(db, 'users', uid, 'accounts', id), data),
      deleteAccount: (id) => deleteDoc(doc(db, 'users', uid, 'accounts', id)),
      recordAndResetAccount: (id, amount) => updateDoc(doc(db, 'users', uid, 'accounts', id), {
        resetBaseline: { amount, date: todayStr() },
        resetHistory: arrayUnion({ amount, date: todayStr() })
      }),
      addCategory: (data) => addDoc(collection(db, 'users', uid, 'categories'), {
        ...data, order: categories.filter(c => c.type === data.type).length, createdAt: serverTimestamp()
      }),
      deleteCategory: (id) => deleteDoc(doc(db, 'users', uid, 'categories', id)),
      addTransaction: (data) => addDoc(collection(db, 'users', uid, 'transactions'), {
        ...data, createdAt: serverTimestamp()
      }),
      updateTransaction: (id, data) => updateDoc(doc(db, 'users', uid, 'transactions', id), data),
      deleteTransaction: (id) => deleteDoc(doc(db, 'users', uid, 'transactions', id)),
      updateSettings: (partial) => setDoc(doc(db, 'users', uid), {
        settings: { ...(userDoc?.settings || DEFAULT_SETTINGS), ...partial }
      }, { merge: true }),
      completeTutorial: (version) => setDoc(doc(db, 'users', uid), {
        tutorialSeenVersion: version
      }, { merge: true })
    }
  }, [user, accounts, categories, userDoc])

  return (
    <DataContext.Provider value={{ accounts, categories, transactions, userDoc, ready, ...api }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
