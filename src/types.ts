import { RequestGenericInterface } from 'fastify'

export type Player = {
    id: string,
    name: string,
    color: string
}

export type PlayerSession = {
    id: string,
    name: string,
    signature: string
}

export interface IQuerystring {
    username: string;
    password: string;
  }

  export interface requestGeneric extends RequestGenericInterface {
    Params: {
        gameid:string
    }

    Querystring:{
        gameid:string
    }
}

export interface requestStatic extends RequestGenericInterface {
    Params: {
        file:string
    }
}