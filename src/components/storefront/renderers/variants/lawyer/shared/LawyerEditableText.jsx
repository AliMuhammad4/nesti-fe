export function LawyerEditableText({
  as: Tag = 'div',
  elementRef,
  field,
  label,
  source = 'persisted',
  collection,
  itemId,
  itemIndex,
  itemField,
  className = '',
  style,
  animated = false,
  children,
}) {
  return (
    <Tag
      ref={elementRef}
      data-storefront-field={field}
      data-storefront-source={source}
      data-storefront-label={label}
      data-storefront-collection={collection}
      data-storefront-item-id={itemId}
      data-storefront-item-index={itemIndex}
      data-storefront-item-field={itemField}
      data-storefront-anim-item={animated ? 'true' : undefined}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
