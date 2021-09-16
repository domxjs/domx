import { css } from "lit";

export const dxStyles = css`

:host {
  background: #0d1117;
  color: #c9d1d9;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  max-width: 800px;
  margin: auto;
  margin-bottom: 5rem;
  font-family: roboto, arial;      
}
h1 {
  margin: 0;
}
img.logo {
  width: 150px;
  margin: 2rem auto 3rem;
}
table {      
  width: 100%;
  border-collapse: collapse;    
}
th, td {
  padding: 1rem 1rem;
  border-bottom: 1px solid #333;
}
a {
  color: #4283db;
}
.nav-link {
  position: absolute;
  padding: 1rem;
  top: 0;
  right:0;
}
`;