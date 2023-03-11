// For more information read the file README.md

import { response } from "./util/utils.fn";

response('heu')
.then((response) => console.log(response))
.catch((err) => console.log(err))