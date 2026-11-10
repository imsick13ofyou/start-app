/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { blocks } from '../entities/onboarding/content'
import { emptyProgress, normalizeProgress, updatePoint, type PointProgress, type ProgressSnapshot } from '../entities/onboarding/model'
import { createProgressRepository } from '../shared/api/progressRepository'
const repository = createProgressRepository()
type ContextValue = { progress: ProgressSnapshot; loading: boolean; error: boolean; update: (id: string, change: Partial<PointProgress>) => void; reset: () => void }
const Context = createContext<ContextValue | null>(null)
/** Загружает и последовательно сохраняет прогресс через адаптер. */
export function ProgressProvider({ children }: { children: ReactNode }) {
 const [progress, setProgress] = useState(() => normalizeProgress(emptyProgress(), blocks)); const [loading,setLoading]=useState(true); const [error,setError]=useState(false); const current=useRef(progress); const queue=useRef<Promise<void>>(Promise.resolve())
 useEffect(()=>{let active=true; repository.getProgress().then(data=>{if(active){const restored=normalizeProgress(data,blocks);current.current=restored;setProgress(restored)}}).catch(()=>{if(active)setError(true)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])
 const update=useCallback((id:string,change:Partial<PointProgress>)=>{const next=updatePoint(current.current,blocks,id,change);current.current=next;setProgress(next);queue.current=queue.current.catch(()=>{}).then(()=>repository.saveProgress(next)).then(()=>setError(false)).catch(()=>setError(true))},[])
 const reset=useCallback(()=>{const next=normalizeProgress(emptyProgress(),blocks);current.current=next;setProgress(next);queue.current=queue.current.catch(()=>{}).then(()=>repository.resetProgress()).then(()=>setError(false)).catch(()=>setError(true))},[])
 return <Context.Provider value={{progress,loading,error,update,reset}}>{children}</Context.Provider>
}
/** Возвращает состояние прогресса внутри приложения. */
export function useProgress(){const value=useContext(Context);if(!value)throw new Error('ProgressProvider отсутствует');return value}
