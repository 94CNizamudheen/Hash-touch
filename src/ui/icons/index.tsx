type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  home: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 11"
    >
      <path
        strokeWidth=".567"
        d="M3.907 8.88H2.016a.756.756 0 0 1-.756-.757V5.59c0-.194.074-.38.207-.52l2.647-2.794a.756.756 0 0 1 1.098 0L7.859 5.07c.133.14.207.326.207.52v2.534a.756.756 0 0 1-.756.757H5.42m-1.513 0V6.8a.19.19 0 0 1 .189-.19H5.23a.19.19 0 0 1 .19.19v2.08m-1.513 0h1.512"
      />
    </svg>
  ),
  menu: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 8 9"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".36"
        d="M7 7V4c0-.707 0-1.06-.22-1.28-.22-.22-.573-.22-1.28-.22H1V7c0 .707 0 1.06.22 1.28.22.22.573.22 1.28.22h3c.707 0 1.06 0 1.28-.22C7 8.06 7 7.707 7 7Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".36"
        d="M4 4.375A1.125 1.125 0 0 1 5.125 5.5M4 4.375A1.125 1.125 0 0 0 2.875 5.5M4 4.375V4m1.125 1.5h-2.25m2.25 0H5.5m-2.625 0H2.5m0 1.5h3M1 2.5l2.77-1.16c.618-.26.927-.39 1.173-.323.16.043.3.138.401.27.156.202.156.54.156 1.213"
      />
    </svg>
  ),
  staff: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 9 7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".525"
        d="M5.025 3.45a1.225 1.225 0 0 0 0-2.45M4.9 6.6H1.65C1.29 6.6 1 6.332 1 6c0-.828.728-1.5 1.625-1.5h1.3c.348-.001.688.103.975.3m2.05-.3v2.1M8 5.55H5.9M4.5 2.225a1.225 1.225 0 1 1-2.45 0 1.225 1.225 0 0 1 2.45 0Z"
      />
    </svg>
  ),
  reports: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 10"
    >
      <path
        strokeWidth=".567"
        d="M4.663 9.01A3.781 3.781 0 0 0 8.44 5.418a.182.182 0 0 0-.185-.19H4.852a.19.19 0 0 1-.189-.188V1.637a.182.182 0 0 0-.189-.185 3.781 3.781 0 0 0 .19 7.558Z"
      />
      <path
        strokeWidth=".567"
        d="M8.439 4.283a3.025 3.025 0 0 0-2.83-2.83.18.18 0 0 0-.19.184v2.647a.19.19 0 0 0 .19.189h2.646a.18.18 0 0 0 .184-.19Z"
      />
    </svg>
  ),
  inventory: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 11"
    >
      <path
        strokeWidth=".567"
        d="M1.26 4.724v3.403c0 .418.338.757.756.757H7.31a.756.756 0 0 0 .756-.757V4.724m-6.806 0 .6-2.098a.756.756 0 0 1 .726-.549h2.077M1.26 4.724h3.403m3.403 0-.6-2.098a.756.756 0 0 0-.727-.549H4.663m3.403 2.647H4.663m0-2.647v2.647"
      />
      <path strokeLinecap="round" strokeWidth=".567" d="M2.205 7.56h2.458" />
    </svg>
  ),
  tableManage: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 9 9"
    >
      <g clipPath="url(#a)">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth=".7"
          d="M1.125 3.75h6.75M3.75 1.125v6.75m-2.625-6a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-.75.75h-5.25a.75.75 0 0 1-.75-.75v-5.25Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h9v9H0z" />
        </clipPath>
      </defs>
    </svg>
  ),
  logout: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 10"
    >
      <path
        strokeLinecap="round"
        strokeWidth=".567"
        d="M3.907 5.322H7.31m0 0-.756-.757m.756.757-.756.756m-.757.756V7.97a.756.756 0 0 1-.756.756H2.772a.756.756 0 0 1-.756-.756V2.675c0-.418.339-.757.756-.757h2.27c.417 0 .755.34.755.757v1.134"
      />
    </svg>
  ),
  dark: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 11"
    >
      <path
        stroke="#fff"
        strokeWidth=".567"
        d="M7.711 6.708c-.58-.101-1.158-.527-1.506-1.177-.412-.769-.382-1.627.015-2.172a1.44 1.44 0 0 1 .134-.157c.094-.094.067-.27-.065-.291a2.685 2.685 0 0 0-.435-.036A2.655 2.655 0 0 0 3.19 5.522 2.655 2.655 0 0 0 5.854 8.17a2.665 2.665 0 0 0 2.229-1.196c.069-.105-.027-.238-.153-.242a1.553 1.553 0 0 1-.219-.023Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  light: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 11"
    >
      <circle cx="4.663" cy="5.522" r="1.891" strokeWidth=".567" />
      <path
        strokeLinecap="round"
        strokeWidth=".567"
        d="M4.663 8.358v.945m0-7.563v.946M1.827 5.522H.882m7.562 0H7.5m-.832-2.005.669-.669M1.99 8.196l.668-.668m4.01 0 .669.668M1.99 2.848l.668.669"
      />
    </svg>
  ),
  arrowRight: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".446"
        d="M1.799 3.288h3.645m0 0L4.402 4.33m1.042-1.042L4.402 2.247"
      />
    </svg>
  ),
  check: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 6 5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".913"
        d="m1.378 2.54 1.369 1.368L5.485 1.17"
      />
    </svg>
  ),
  circle: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 7"
    >
      <path d="M6.187 3.107a3.08 3.08 0 1 1-3.08-3.08v3.08h3.08Z" />
    </svg>
  ),
  dollar: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 9"
    >
      <path
        fill="#fff"
        d="M4.903.008a4.188 4.188 0 1 0 0 8.376 4.188 4.188 0 0 0 0-8.376Zm.306 6.538v.322a.306.306 0 1 1-.613 0v-.322a1.418 1.418 0 0 1-.719-.331 1.43 1.43 0 0 1-.506-.98.306.306 0 0 1 .502-.262.31.31 0 0 1 .11.208.817.817 0 0 0 .29.568.858.858 0 0 0 .61.204c.637 0 .94-.245.94-.743 0-.331-.29-.687-.92-.687-1.332 0-1.532-.817-1.532-1.287a1.43 1.43 0 0 1 1.225-1.36v-.32a.306.306 0 0 1 .613 0v.332a1.475 1.475 0 0 1 1.226 1.315.307.307 0 0 1-.609.062.874.874 0 0 0-.907-.785h-.073a.817.817 0 0 0-.858.776c0 .336.11.662.919.662 1.005 0 1.532.654 1.532 1.3a1.27 1.27 0 0 1-1.246 1.311l.016.017Z"
      />
    </svg>
  ),
  reports_second: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 23 23"
    >
      <path d="m5.607 15.42-2.803 2.747V10.28h2.803m4.673 3.42-1.467-1.252-1.337 1.233v-7.14h2.804m4.673 5.608-2.804 2.804V2.803h2.804m2.626 9.168-1.692-1.691h4.673v4.673l-1.673-1.673-6.738 6.682-3.243-2.823-3.532 3.42h-2.57l6.046-5.924 3.299 2.785" />
    </svg>
  ),
  search: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 6 6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".399"
        d="M2.813 4.997a2.108 2.108 0 1 0 0-4.216 2.108 2.108 0 0 0 0 4.216Zm2.33.223-.444-.445"
      />
    </svg>
  ),
  trash: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 8 8"
    >
      <path d="M1.808 7.942a.782.782 0 0 1-.577-.23A.783.783 0 0 1 1 7.135V.942H.5v-.5h2V.057h3v.385h2v.5H7v6.193c0 .23-.077.422-.231.576a.782.782 0 0 1-.577.231H1.808Zm1.096-1.5h.5v-4.5h-.5v4.5Zm1.692 0h.5v-4.5h-.5v4.5Z" />
    </svg>
  ),
  import: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 10"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".675"
        d="M6.665 3.838c1.35.116 1.9.81 1.9 2.328v.049c0 1.676-.67 2.348-2.347 2.348h-2.44C2.1 8.563 1.43 7.89 1.43 6.215v-.049c0-1.507.543-2.201 1.87-2.325M5 1.25v4.83"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".675"
        d="M6.256 5.244 4.999 6.5 3.743 5.244"
      />
    </svg>
  ),
  export: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 10"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".675"
        d="M6.665 3.838c1.35.116 1.9.81 1.9 2.328v.049c0 1.676-.67 2.348-2.347 2.348h-2.44C2.1 8.563 1.43 7.89 1.43 6.215v-.049c0-1.507.543-2.201 1.87-2.325M5 6.125V1.858m1.256.836L4.999 1.438 3.743 2.694"
      />
    </svg>
  ),
  plus: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 6 6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".672"
        d="M3.241 5.241V.76M1 3h4.483"
      />
    </svg>
  ),
  addNote: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".647"
        d="M5.898 3.298V2.073c0-1.16-.27-1.45-1.359-1.45H2.364c-1.088 0-1.358.29-1.358 1.45v3.24c0 .765.42.946.93.4l.002-.003a.506.506 0 0 1 .8.043l.29.388M2.3 2.061h2.303M2.589 3.212h1.726"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth=".432"
        d="M5.24 4.297 4.22 5.316a.355.355 0 0 0-.086.17l-.054.388c-.02.14.077.239.218.219l.389-.055a.342.342 0 0 0 .17-.086l1.018-1.02c.176-.175.26-.379 0-.638-.256-.256-.46-.173-.636.003Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth=".432"
        d="M5.092 4.444c.086.31.328.552.639.639"
      />
    </svg>
  ),
  serveLater: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".647"
        d="M3.02 5.439H.855a.289.289 0 0 0-.288.287v.288c0 .475 0 .863.864.863h2.014M.94 5.439V4.288a2.302 2.302 0 0 1 2.3-2.302h.418a2.307 2.307 0 0 1 2.275 1.948"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".647"
        d="M4.171 1.842a.73.73 0 0 1-.026.195 2.249 2.249 0 0 0-.486-.051h-.417c-.167 0-.328.017-.484.051a.72.72 0 1 1 1.413-.196Zm.144 1.87H2.59"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".432"
        d="M6.33 5.726a1.151 1.151 0 1 1-2.303 0 1.151 1.151 0 0 1 2.302 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".432"
        d="m5.466 6.014-.287-.31v-.553"
      />
    </svg>
  ),
  member: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth=".647"
        d="M5.746 2.924H1.142v2.302c0 .864.287 1.151 1.15 1.151h2.303c.863 0 1.15-.287 1.15-1.15V2.923Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth=".647"
        d="M6.186 2.061v.288c0 .316-.152.575-.575.575H1.294c-.44 0-.575-.259-.575-.575V2.06c0-.316.135-.575.575-.575h4.317c.423 0 .575.259.575.575Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth=".647"
        d="M3.348 1.486H1.76a.27.27 0 0 1 .008-.374l.409-.41a.276.276 0 0 1 .388 0l.783.784Zm1.793 0H3.553l.782-.783a.276.276 0 0 1 .389 0l.409.409a.27.27 0 0 1 .008.374Zm-2.57 1.438v1.48c0 .23.254.365.446.241l.27-.178a.287.287 0 0 1 .317 0l.256.172a.287.287 0 0 0 .446-.239V2.924H2.571Z"
      />
    </svg>
  ),
  print: (props: IconProps) => (
    <svg
      {...props}
      width="7"
      height="7"
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.08496 2.06108H4.81861V1.48557C4.81861 0.910067 4.60279 0.622314 3.95535 0.622314H2.94822C2.30078 0.622314 2.08496 0.910067 2.08496 1.48557V2.06108Z"
        strokeWidth="0.647443"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.6028 4.36328V5.51429C4.6028 6.0898 4.31505 6.37755 3.73954 6.37755H3.16404C2.58853 6.37755 2.30078 6.0898 2.30078 5.51429V4.36328H4.6028Z"
        strokeWidth="0.647443"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.04185 2.92454V4.3633C6.04185 4.9388 5.7541 5.22656 5.17859 5.22656H4.60309V4.3633H2.30107V5.22656H1.72556C1.15006 5.22656 0.862305 4.9388 0.862305 4.3633V2.92454C0.862305 2.34903 1.15006 2.06128 1.72556 2.06128H5.17859C5.7541 2.06128 6.04185 2.34903 6.04185 2.92454Z"
        strokeWidth="0.647443"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.8912 4.36328H4.54302H2.01367"
        strokeWidth="0.431629"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.01367 3.21216H2.87693"
        strokeWidth="0.431629"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  comp: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".647"
        d="M2.588 6.377h1.727c1.439 0 2.014-.575 2.014-2.014V2.637c0-1.44-.575-2.015-2.014-2.015H2.588C1.15.622.574 1.198.574 2.637v1.726c0 1.439.576 2.014 2.014 2.014Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth=".432"
        d="M4.48 5.37V4.248m0-2.058v-.56m0 2.057a.748.748 0 1 0 0-1.496.748.748 0 0 0 0 1.496ZM2.425 5.37v-.56m0-2.058V1.63m0 3.18a.748.748 0 1 0 0-1.497.748.748 0 0 0 0 1.496Z"
      />
    </svg>
  ),
  flag: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth=".647"
        d="M1.481.622v5.755m0-5.179h3.223c.777 0 .95.432.403.978l-.345.346c-.23.23-.23.604 0 .805l.345.346c.547.546.345.978-.403.978H1.481"
      />
    </svg>
  ),
  changeTable: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".647"
        d="M6.33 3.137v1.726c0 .72-.519 1.151-1.152 1.151H1.725c-.633 0-1.15-.431-1.15-1.15V3.136c0-.72.517-1.151 1.15-1.151h3.453c.633 0 1.151.431 1.151 1.15ZM4.606 6.014V1.986M2.3 6.014V1.986"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".432"
        d="M1.15 6.877h4.604M1.15 1.122h4.604"
      />
    </svg>
  ),
  voidOrder: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".647"
        d="m3.018.689-1.436.54c-.331.124-.602.516-.602.867v2.138c0 .34.225.785.498.99l1.238.923c.405.305 1.073.305 1.479 0l1.237-.923c.273-.205.498-.65.498-.99V2.096c0-.354-.27-.745-.602-.87L3.893.69a1.463 1.463 0 0 0-.875 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth=".647"
        d="M4.07 3.914 2.849 2.691m1.207.015L2.833 3.929"
      />
    </svg>
  ),
  cash: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 5"
    >
      <path
        fill="#454444"
        d="M-.002 0h6.463v4.385H-.002V0ZM3.23 1.096c.285 0 .56.116.761.321a1.106 1.106 0 0 1 0 1.55 1.068 1.068 0 0 1-1.523 0 1.106 1.106 0 0 1 0-1.55c.202-.205.476-.32.761-.32ZM1.433.731c0 .194-.075.38-.21.517a.712.712 0 0 1-.508.214v1.461c.19 0 .373.077.508.214s.21.323.21.517h3.59c0-.194.076-.38.211-.517a.712.712 0 0 1 .508-.214V1.462a.712.712 0 0 1-.508-.214.737.737 0 0 1-.21-.517h-3.59Z"
      />
    </svg>
  ),
  homeTypeTwo: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 8 8"
    >
      <path
        fill="#454444"
        stroke="#fff"
        strokeWidth=".45"
        d="M.91 4.061c0-.687 0-1.03.156-1.314.156-.285.44-.461 1.01-.815l.6-.372c.6-.373.902-.56 1.234-.56.333 0 .633.187 1.235.56l.6.372c.57.354.854.53 1.01.815.155.285.155.627.155 1.314v.457c0 1.17 0 1.755-.351 2.118C6.207 7 5.64 7 4.51 7h-1.2c-1.13 0-1.697 0-2.048-.364C.91 6.273.91 5.688.91 4.517v-.456Z"
      />
      <path fill="#454444" d="M3.91 4.9v.9-.9Z" />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth=".45"
        d="M3.91 4.9v.9"
      />
    </svg>
  ),
  soldOut: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 22 22"
    >
      <path d="M17.481 3.208H3.731v15.125h8.25v1.375H2.356V1.833h16.5v8.25h-1.375V3.208ZM7.856 7.333h8.25V5.958h-8.25v1.375Zm-2.75 0V5.958h1.375v1.375H5.106Zm2.75 4.125v-1.375h4.125v1.375H7.856Zm-2.75 0v-1.375h1.375v1.375H5.106Zm2.75 4.125v-1.375h2.75v1.375h-2.75Zm7.563-1.66-1.944-1.944-.972.973 1.944 1.944-1.944 1.944.972.972 1.944-1.944 1.944 1.944.972-.972-1.944-1.944 1.944-1.945-.972-.972-1.944 1.945Zm-10.313 1.66v-1.375h1.375v1.375H5.106ZM15.42 8.708a6.188 6.188 0 1 1 0 12.375 6.188 6.188 0 0 1 0-12.375Z" />
    </svg>
  ),
  money: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 43 51"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.2"
        d="M-8.776 21.5-16 21.073C-10.823 7.772 4.042.202 18.532 3.965c15.436 4.012 24.606 19.37 20.48 34.3C35.597 50.614 24.16 58.807 11.571 59"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.2"
        d="M12 59.001c-15.4 0-28-14-28-30.8m32.491-3.578c-.986-1.036-3.396-3.463-7.21-1.736-3.81 1.722-4.416 7.269 1.35 7.86 2.604.266 4.303-.308 5.86 1.316 1.557 1.63 1.845 6.154-2.13 7.375-3.977 1.22-6.556-.795-7.247-1.425m4.628-18.155v2.212m0 17.743v2.444"
      />
    </svg>
  ),
  reserve: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 32 47"
    >
      <path d="M-5.646 53.541c-1.472 0-2.732-.523-3.78-1.57-1.047-1.048-1.572-2.31-1.574-3.784V5.354c0-1.472.525-2.732 1.574-3.78C-8.376.526-7.116.002-5.646 0H26.48c1.473 0 2.733.525 3.783 1.574 1.05 1.05 1.573 2.31 1.571 3.78v42.833c0 1.473-.524 2.734-1.571 3.783-1.048 1.05-2.309 1.573-3.783 1.572H-5.646Zm0-5.354H26.48V5.354h-5.354v18.74l-6.693-4.016-6.692 4.016V5.354H-5.646v42.833Z" />
    </svg>
  ),
  message: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 60 73"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6.917"
        d="M32.417 27.292H5.083m27.334 13.833H17.042m7.43 22.843 7.945 4.824V58.417h6.833c2.718 0 5.326-1.093 7.248-3.039a10.44 10.44 0 0 0 3.002-7.336V20.375c0-2.751-1.08-5.39-3.002-7.336A10.188 10.188 0 0 0 39.25 10h-41a10.188 10.188 0 0 0-7.248 3.039A10.44 10.44 0 0 0-12 20.375v15.563"
      />
    </svg>
  ),
  shortMessage: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 52 53"
    >
      <path d="M45.111 0H-3.11A6.896 6.896 0 0 0-10 6.889V24.11h6.889V13.778L18.933 30.31a3.444 3.444 0 0 0 4.134 0L45.11 13.778v31H-.817L-1.5 54h46.611c3.8 0 6.889-2.333 6.889-9.222V6.888A6.896 6.896 0 0 0 45.111 0ZM21 23.25-.817 6.889h43.634L21 23.25Z" />
    </svg>
  ),
  refresh: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 10"
    >
      <g clipPath="url(#a)">
        <path d="m1.533 5.417-.22.221a.313.313 0 0 0 .44 0l-.22-.221Zm.92-.473a.313.313 0 1 0-.44-.444l.44.444Zm-1.4-.444a.312.312 0 0 0-.44.444l.44-.444Zm6.704-1.42a.312.312 0 1 0 .532-.328l-.532.328ZM5.033.938C2.93.938 1.22 2.63 1.22 4.722h.625c0-1.742 1.425-3.16 3.188-3.16V.939ZM1.22 4.722v.695h.625v-.695H1.22Zm.534.917.7-.695-.442-.444-.7.695.442.444Zm0-.444-.7-.695-.441.444.7.694.44-.443Zm6.535-2.442A3.817 3.817 0 0 0 5.033.938v.625A3.193 3.193 0 0 1 7.757 3.08l.532-.327Zm.175 1.83.22-.222a.313.313 0 0 0-.44 0l.22.222Zm-.922.472a.313.313 0 1 0 .44.445l-.44-.445Zm1.405.445a.313.313 0 1 0 .44-.445l-.44.445ZM2.216 6.92a.313.313 0 1 0-.532.327l.532-.328ZM4.95 9.062c2.11 0 3.825-1.691 3.825-3.785H8.15c0 1.742-1.43 3.16-3.2 3.16v.624Zm3.825-3.785v-.695H8.15v.695h.625Zm-.532-.917-.702.694.44.445.702-.695-.44-.444Zm0 .444.703.695.44-.445-.703-.694-.44.444Zm-6.56 2.442A3.834 3.834 0 0 0 4.95 9.063v-.626A3.208 3.208 0 0 1 2.216 6.92l-.533.328Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h10v10H0z" />
        </clipPath>
      </defs>
    </svg>
  ),
  reset: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 10"
    >
      <g
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".833"
        clipPath="url(#a)"
      >
        <path d="M8.738 4.7a3.75 3.75 0 1 0-3.464 4.04" />
        <path d="M5 2.917V5l.625.625M7.917 7.5v.004m.883.88a1.25 1.25 0 1 0-1.767 0c.174.174.469.435.884.783.438-.371.732-.632.883-.783Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h10v10H0z" />
        </clipPath>
      </defs>
    </svg>
  ),
  customer: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 6 7"
    >
      <g clipPath="url(#a)">
        <path
          fill="#fff"
          d="M3.024.804a1.195 1.195 0 1 1-1.195 1.195v-.052A1.195 1.195 0 0 1 3.025.804Zm.478 2.868a1.195 1.195 0 0 1 1.195 1.195v.239a.478.478 0 0 1-.478.478h-2.39a.478.478 0 0 1-.478-.478v-.24a1.195 1.195 0 0 1 1.195-1.194h.956Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.155.325h5.736v5.736H.155z" />
        </clipPath>
      </defs>
    </svg>
  ),
  payment: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 6 7"
    >
      <g fill="#fff" clipPath="url(#a)">
        <path d="M3.502 1.584h-.956c-.902 0-1.353 0-1.632.28-.202.201-.259.491-.274.974h4.767c-.015-.483-.072-.773-.273-.974-.28-.28-.731-.28-1.632-.28Z" />
        <path
          fillRule="evenodd"
          d="M3.501 5.408h-.956c-.901 0-1.352 0-1.632-.28-.28-.28-.28-.731-.28-1.632v-.299h4.78v.299c0 .901 0 1.352-.28 1.632-.28.28-.73.28-1.632.28Zm.489-1.853c.103 0 .198 0 .275.01a.413.413 0 0 1 .249.113c.074.074.1.164.112.249.01.077.01.172.01.275v.022c0 .103 0 .198-.01.275a.413.413 0 0 1-.112.248.413.413 0 0 1-.249.113c-.077.01-.172.01-.275.01h-.022c-.103 0-.198 0-.275-.01a.413.413 0 0 1-.249-.113.413.413 0 0 1-.112-.248c-.01-.077-.01-.172-.01-.275v-.022c0-.103 0-.198.01-.275a.413.413 0 0 1 .112-.249.413.413 0 0 1 .249-.112c.077-.01.172-.01.275-.01h.022Zm-2.58.3a.18.18 0 0 1 .179-.18h.478a.18.18 0 1 1 0 .359h-.478a.18.18 0 0 1-.18-.18Zm0 .716a.18.18 0 0 1 .179-.179h.956a.18.18 0 0 1 0 .359h-.956a.18.18 0 0 1-.18-.18Z"
          clipRule="evenodd"
        />
        <path d="M3.698 3.931a.168.168 0 0 1 .043-.01c.05-.007.12-.007.238-.007s.189 0 .239.007a.168.168 0 0 1 .042.01l.001.001a.168.168 0 0 1 .01.042c.007.05.007.12.007.239 0 .118 0 .188-.007.238a.168.168 0 0 1-.01.042v.001H4.26a.168.168 0 0 1-.042.01c-.05.007-.12.008-.239.008-.117 0-.188 0-.238-.008a.168.168 0 0 1-.042-.01h-.001a.168.168 0 0 1-.01-.043 2.077 2.077 0 0 1-.007-.238c0-.118 0-.188.007-.239a.168.168 0 0 1 .01-.042Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.155.628h5.736v5.736H.155z" />
        </clipPath>
      </defs>
    </svg>
  ),
  tagCrossFill: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 17 17"
    >
      <path d="M13.943 4.404a2.74 2.74 0 0 0-1.926-.797H5.98a2.692 2.692 0 0 0-1.92.803l-.053.053-2.025 2.773a2.466 2.466 0 0 0 0 2.667l1.973 2.747.052.06a2.695 2.695 0 0 0 1.92.796h6.05a2.74 2.74 0 0 0 1.927-.797 2.7 2.7 0 0 0 .795-1.923V6.327a2.702 2.702 0 0 0-.756-1.923ZM11.398 9.81a.66.66 0 0 1-.469 1.124.657.657 0 0 1-.464-.195l-1.25-1.251-1.243 1.244a.658.658 0 1 1-.933-.928l1.25-1.245-1.25-1.252a.66.66 0 0 1 .933-.928l1.243 1.245 1.25-1.252a.658.658 0 1 1 .933.929L10.15 8.56l1.25 1.251Z" />
    </svg>
  ),
  backspace: (props: IconProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z"
      />
    </svg>
  ),
  
printer: (props: IconProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 9V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5"
    />
    <rect
      x="5"
      y="9"
      width="14"
      height="7"
      rx="1.5"
      strokeWidth="1.5"
    />
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 13v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6"
    />
    <circle cx="17" cy="12" r="0.5" fill="currentColor" />
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      d="M10 17h4"
    />
  </svg>
),

device: (props: IconProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <rect
      x="7"
      y="2"
      width="10"
      height="20"
      rx="2"
      strokeWidth="1.5"
    />
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      d="M10 5h4"
    />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
),

network: (props: IconProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="4" r="2.5" strokeWidth="1.5" />
    <circle cx="6" cy="18" r="2.5" strokeWidth="1.5" />
    <circle cx="18" cy="18" r="2.5" strokeWidth="1.5" />
    <path
      d="M12 6.5v4.5m0 0-5 4m5-4 5 4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
),

kds: (props: IconProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="13"
      rx="2"
      strokeWidth="1.5"
    />
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      d="M7 21h10M12 17v4"
    />
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 9h5m-5 3h3"
    />
  </svg>
),

user: (props: IconProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
    <path
      d="M6 21v-1a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v1"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
),

sync: (props: IconProps) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 10.5V6.5a1 1 0 0 0-1-1h-3.5M3 13.5v4a1 1 0 0 0 1 1h3.5"
    />
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 6.5 19 4.5m-2 2 2-2M3 17.5l2 2m2-2-2 2"
    />
    <path
      d="M7.5 7.5A7 7 0 0 1 19 12M16.5 16.5A7 7 0 0 1 5 12"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
),
};
