function CentralDispatchLogo({ size = 32, className = '', alt = '' }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
      aria-hidden={alt ? undefined : true}
    />
  )
}

export default CentralDispatchLogo
