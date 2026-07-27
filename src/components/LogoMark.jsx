function LogoMark({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Super Dispatching Services"
    >
      <path
        d="M16 2C9.4 2 4 7.2 4 13.6 4 21.8 16 30 16 30s12-8.2 12-16.4C28 7.2 22.6 2 16 2z"
        fill="#e8463c"
      />
      <circle cx="16" cy="13" r="8" fill="#ffffff" />
      <circle cx="16" cy="13" r="4.5" fill="#e8463c" />
    </svg>
  )
}

export default LogoMark
