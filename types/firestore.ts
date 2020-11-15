import { Timestamp, FieldPath, WhereFilterOp, OrderByDirection } from '@firebase/firestore-types'

export type DocCommon = {
    id: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

export type Where = {
    fieldPath: string | FieldPath
    opStr: WhereFilterOp
    value: any
}

export type OrderBy = {
    fieldPath: string | FieldPath
    directionStr?: OrderByDirection
}

export type Range = {
    startIndex: number
    length?: number
}
