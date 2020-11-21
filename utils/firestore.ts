import {
    FirebaseFirestore,
    GetOptions,
    CollectionReference,
    Query,
    QueryDocumentSnapshot,
    DocumentSnapshot,
    DocumentReference,
    DocumentData,
    Timestamp,
} from '@firebase/firestore-types'
import firebase from 'firebase/app'
import * as FirestoreType from '../types/firestore'

const _getFindAllQuery = (query: Query, orderBys?: FirestoreType.OrderBy[], limit?: number): Query => {
    let res: Query = query
    if (orderBys) {
        orderBys.forEach((orderBy) => {
            res = res.orderBy(orderBy.fieldPath, orderBy.directionStr)
        })
    }
    if (limit) {
        res = res.limit(limit)
    }
    return res
}

const _getConditionQuery = (query: Query, conditions: FirestoreType.Where[]): Query => {
    let res: Query = query
    conditions.forEach((condition) => {
        res = res.where(condition.fieldPath, condition.opStr, condition.value)
    })
    return res
}

export const getCreateTimestamp = (): DocumentData => {
    const dt = firebase.firestore.FieldValue.serverTimestamp()
    const res: DocumentData = {
        createdAt: dt,
        updatedAt: dt,
    }
    return res
}

export const getUpdateTimestamp = (): DocumentData => {
    const dt = firebase.firestore.FieldValue.serverTimestamp()
    const res: DocumentData = {
        updatedAt: dt,
    }
    return res
}

export const getDeleteTimestamp = (): DocumentData => {
    const dt = firebase.firestore.FieldValue.serverTimestamp()
    const res: DocumentData = {
        deletedAt: dt,
    }
    return res
}

export const getFirestoreTimestamp = (date: Date): firebase.firestore.Timestamp => {
    return firebase.firestore.Timestamp.fromDate(date)
}

export const getDefaultInit = (): {
    id: string
    createdAt: Timestamp
    updatedAt: Timestamp
} => {
    const dt = firebase.firestore.Timestamp.fromDate(new Date())
    return {
        id: '',
        createdAt: dt,
        updatedAt: dt,
    }
}

export const find = async <T>(
    $fs: FirebaseFirestore,
    collectionId: CollectionReference['id'],
    documentId: DocumentReference['id'],
    setData: (doc: DocumentSnapshot | QueryDocumentSnapshot, data?: DocumentData) => T | null,
    source: GetOptions['source'] = 'default',
): Promise<T> => {
    const doc = await $fs.collection(collectionId).doc(documentId).get({ source })
    const res = setData(doc, doc.data())
    if (!res) {
        throw new Error('no data')
    }
    return res
}

export const findByConditions = async <T>(
    $fs: FirebaseFirestore,
    collectionId: CollectionReference['id'],
    conditions: FirestoreType.Where[],
    setData: (doc: DocumentSnapshot | QueryDocumentSnapshot, data?: DocumentData) => T | null,
    source: GetOptions['source'] = 'default',
    orderBys?: FirestoreType.OrderBy[],
    limit?: number,
    fetchRange?: FirestoreType.Range,
): Promise<T[]> => {
    let query: Query = $fs.collection(collectionId)
    query = _getFindAllQuery(query, orderBys, limit)
    query = _getConditionQuery(query, conditions)

    const collection = await query.get({ source })
    const res: T[] = []

    const startIndex: number = fetchRange?.startIndex || 0
    collection.docs.some((doc, index) => {
        if (startIndex <= index) {
            if (fetchRange?.length) {
                if (startIndex + fetchRange.length <= index) {
                    return true
                }
            }
            const data = setData(doc, doc.data())
            if (data) {
                res.push(data)
            }
        }
    })
    return res
}
