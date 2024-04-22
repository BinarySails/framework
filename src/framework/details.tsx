import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cn from "classnames";
import NextLink from "next/link";
import { UrlObject } from "url";
import {
  faCheckCircle,
  faEllipsis,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { BillingAddress, CfdiUses, TaxRegimes, useClient } from "joger-api";
import { MiniMenu } from "./menus";
import React, { useRef, useState } from "react";

export function DetailsSeparator() {
  return <div className="w-full border-b border-gray-200" role="separator" />;
}

export function DetailsSectionHeader({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex justify-between items-center w-full", className)}>
      <h2 className="font-bold text-lg">{title}</h2>
      <div className="flex flex-shrink-0 gap-2">{children ?? null}</div>
    </div>
  );
}

export function DetailsBox({
  data,
}: {
  data: {
    value: string | React.ReactNode;
    label: string;
  }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {data.map(({ label, value }) => (
        <div className="flex gap-5" key={label}>
          <div className="text-gray-700 text-sm min-w-[110px] md:min-w-[155px]">
            {label}
          </div>
          <div className="text-sm">{value ?? "-"}</div>
        </div>
      ))}
    </div>
  );
}

export function DetailsGeneralDescription({
  icon,
  title,
  description,
}: {
  icon: IconProp;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex gap-3 items-center">
      <div className="border border-black rounded-lg w-[40px] h-[40px] p-6 flex justify-center items-center">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <div className="text-lg">{title}</div>
        {description ? (
          <div className="text-md text-gray-500">{description}</div>
        ) : null}
      </div>
    </div>
  );
}

// copy paste from next/link because it's not exported
type Url = string | UrlObject;
type InternalLinkProps = {
  /**
   * The path or URL to navigate to. It can also be an object.
   *
   * @example https://nextjs.org/docs/api-reference/next/link#with-url-object
   */
  href: Url;
  /**
   * Optional decorator for the path that will be shown in the browser URL bar. Before Next.js 9.5.3 this was used for dynamic routes, check our [previous docs](https://github.com/vercel/next.js/blob/v9.5.2/docs/api-reference/next/link.md#dynamic-routes) to see how it worked. Note: when this path differs from the one provided in `href` the previous `href`/`as` behavior is used as shown in the [previous docs](https://github.com/vercel/next.js/blob/v9.5.2/docs/api-reference/next/link.md#dynamic-routes).
   */
  as?: Url;
  /**
   * Replace the current `history` state instead of adding a new url into the stack.
   *
   * @defaultValue `false`
   */
  replace?: boolean;
  /**
   * Whether to override the default scroll behavior
   *
   * @example https://nextjs.org/docs/api-reference/next/link#disable-scrolling-to-the-top-of-the-page
   *
   * @defaultValue `true`
   */
  scroll?: boolean;
  /**
   * Update the path of the current page without rerunning [`getStaticProps`](/docs/basic-features/data-fetching/get-static-props.md), [`getServerSideProps`](/docs/basic-features/data-fetching/get-server-side-props.md) or [`getInitialProps`](/docs/api-reference/data-fetching/get-initial-props.md).
   *
   * @defaultValue `false`
   */
  shallow?: boolean;
  /**
   * Forces `Link` to send the `href` property to its child.
   *
   * @defaultValue `false`
   */
  passHref?: boolean;
  /**
   * Prefetch the page in the background.
   * Any `<Link />` that is in the viewport (initially or through scroll) will be preloaded.
   * Prefetch can be disabled by passing `prefetch={false}`. When `prefetch` is set to `false`, prefetching will still occur on hover. Pages using [Static Generation](/docs/basic-features/data-fetching/get-static-props.md) will preload `JSON` files with the data for faster page transitions. Prefetching is only enabled in production.
   *
   * @defaultValue `true`
   */
  prefetch?: boolean;
  /**
   * The active locale is automatically prepended. `locale` allows for providing a different locale.
   * When `false` `href` has to include the locale as the default behavior is disabled.
   */
  locale?: string | false;
  /**
   * Enable legacy link behavior.
   * @defaultValue `false`
   * @see https://github.com/vercel/next.js/commit/489e65ed98544e69b0afd7e0cfc3f9f6c2b803b7
   */
  legacyBehavior?: boolean;
  /**
   * Optional event handler for when the mouse pointer is moved onto Link
   */
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  /**
   * Optional event handler for when Link is touched.
   */
  onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>;
  /**
   * Optional event handler for when Link is clicked.
   */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};
export function Link(
  props: Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof InternalLinkProps
  > &
    InternalLinkProps & {
      children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>,
) {
  return (
    <NextLink className="font-bold hover:underline text-aqua" {...props} />
  );
}

export function UserDisplay({ id }: { id: string }) {
  const { client } = useClient();

  const { data, isLoading } = client.users.useSwr((f) => f.one(id))();

  if (!data || isLoading) return <>id</>;

  return (
    <>
      {data.name} {data.surname}
    </>
  );
}

export function SmartLink({
  children,
  hydrate,
  onlyHydrate,
  ...props
}: Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof InternalLinkProps
> &
  Omit<InternalLinkProps, "href"> & {
    children?: React.ReactNode | string;
    hydrate?: boolean;
    onlyHydrate?: boolean;
  } & React.RefAttributes<HTMLAnchorElement>) {
  const extractor = typeof children === "string" ? children.split("_") : null;
  const prefix = extractor ? extractor[0] : null;

  let link;

  switch (prefix) {
    case "usr":
      link = `/dashboard/usuarios/${children}`;
      break;
    case "frt":
      link = `/dashboard/rentas/${children}`;
      break;
    case "ivo":
      link = `/dashboard/recibos/${children}`;
      break;
    default:
      link = "";
  }

  if (link) {
    if (onlyHydrate) {
      return prefix === "usr" && typeof children === "string" ? (
        <UserDisplay id={children} />
      ) : (
        children
      );
    } else {
      return (
        <NextLink
          href={link}
          className="font-bold hover:underline text-aqua"
          {...props}
        >
          {prefix === "usr" && hydrate && typeof children === "string" ? (
            <UserDisplay id={children} />
          ) : (
            children
          )}
        </NextLink>
      );
    }
  }

  return <div>{children}</div>;
}

export function BillingAddressesSlider({
  onDelete,
  billing,
  className,
  deleteBillingAddress,
  activateBillingAddress,
  onActivate,
  onClickAdd,
}: {
  onDelete?: (id: string) => void;
  billing: BillingAddress[];
  deleteBillingAddress: (id: string) => Promise<BillingAddress>;
  activateBillingAddress: (
    id: string,
    state?: boolean,
  ) => Promise<BillingAddress>;
  onActivate?: (id: string, state: boolean) => void;
  className?: string;
  onClickAdd?: () => void;
}) {
  const [actions, setActions] = useState(false);
  const [pickedActions, setPickedActions] = useState<null | string>(null);
  const actionsRef = useRef<HTMLElement>(null);

  const inOrder = billing.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const handleDeleteBillingAddress = (id: string) => {
    const f = async () => {
      const r = await deleteBillingAddress(id);
      onDelete?.(r.id);
    };

    void f().then();
  };

  const handleActiveBillingAddress = (id: string) => {
    const f = async () => {
      const isAlreadyActive = billing.find((it) => it.selected)?.id === id;
      const r = await activateBillingAddress(id, !isAlreadyActive);

      onActivate?.(r.id, r.selected);
    };

    void f().then();
  };

  return (
    <>
      <MiniMenu
        onOpen={setActions}
        open={actions}
        options={[
          {
            label: "Eliminar",
            style: "danger",
            data: {
              mode: "button",
              onClick: () => {
                if (pickedActions) {
                  handleDeleteBillingAddress(pickedActions);
                }
                setActions(false);
              },
            },
          },
        ]}
        reference={actionsRef.current}
      />
      <div className={cn("", className)}>
        {inOrder.map((it) => (
          <BillingDetailsBox
            data={it}
            key={it.id}
            onClick={() => {
              handleActiveBillingAddress(it.id);
            }}
            onActionClick={(ev) => {
              // @ts-ignore -- wtf this is valid
              actionsRef.current = ev.currentTarget;

              setActions(true);
              setPickedActions(it.id);
            }}
          />
        ))}

        <button
          className={
            "flex justify-center items-center border rounded-xl p-5 relative text-left min-w-[250px] w-full group hover:border-black active:scale-95 transition-all"
          }
          type="button"
          onClick={onClickAdd}
        >
          <div className="text-gray-400 text-3xl group-hover:text-black transition-all text-center">
            <FontAwesomeIcon icon={faPlusCircle} />
            <div className="text-xs">Agregar dirección de facturación</div>
          </div>
        </button>
      </div>
    </>
  );
}

export function BillingDetailsBox({
  data,
  onClick,
  className,
  onActionClick,
}: {
  onClick?: () => void;
  data: BillingAddress;
  className?: string;
  onActionClick?: <T>(ev: React.MouseEvent<T>) => void;
}) {
  return (
    <>
      <button
        className={cn(
          "flex flex-col border rounded-xl p-5 relative text-left min-w-[250px] w-full",
          {
            "border-aqua": data.selected,
          },
          className,
        )}
        onClick={onClick}
        type="button"
      >
        <div className="absolute right-0 top-0 p-2">
          <div className="flex gap-2">
            <FontAwesomeIcon
              icon={faEllipsis}
              onClick={(e) => {
                e.stopPropagation();
                onActionClick?.(e);
              }}
              role="button"
            />
            {data.selected ? (
              <FontAwesomeIcon className="text-aqua" icon={faCheckCircle} />
            ) : null}
          </div>
        </div>
        <div>{data.name}</div>
        <div className="text-xs">{data.rfc}</div>
        <div className="text-xs text-left">
          {data.street} {data.ext_number} {data.neighborhood} {data.city}{" "}
          {data.state} {data.postal_code} {data.country}
        </div>
        <div className="text-xs">
          <b>Regimen:</b> {TaxRegimes[data.tax_regime]}
        </div>
        <div className="text-xs">
          <b>Uso de CFDI:</b> {CfdiUses[data.cfdi_use]}
        </div>
      </button>
    </>
  );
}

export function DetailsSquare({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col py-2 px-5 w-full text-left bg-white rounded-xl border border-aqua">
      <div className="text-lg font-bold">{title}</div>
      <div>{description}</div>
    </div>
  );
}
