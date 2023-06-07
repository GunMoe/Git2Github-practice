/* Copyright (c) 2015, 2019, Oracle and/or its affiliates. All rights reserved. */

import { PoolAttributes } from "oracledb";

export default <{ [key: string]: PoolAttributes }>{
  nsl: {
    user: "nsl",
    password: "nsl",
    connectString: "127.0.0.1/xe"
  },
  psr: {
    user: "nsl",
    password: "nsl",
    connectString: "127.0.0.1/xe"
  }
};