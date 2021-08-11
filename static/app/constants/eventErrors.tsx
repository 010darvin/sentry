export enum JavascriptProcessingErrors {
  JS_GENERIC_FETCH_ERROR = 'js_generic_fetch_error',
  JS_TRUNCATED_URL = 'js_truncated_url',
  JS_INVALID_URL = 'js_invalid_url',
  JS_INVALID_HTTP_CODE = 'js_invalid_http_code',
  JS_INVALID_CONTENT = 'js_invalid_content',
  JS_NO_COLUMN = 'js_no_column', // deprecated
  JS_MISSING_ROW_OR_COLUMN = 'js_missing_row_or_column',
  JS_MISSING_SOURCE = 'js_no_source',
  JS_INVALID_SOURCEMAP = 'js_invalid_sourcemap',
  JS_TOO_MANY_REMOTE_SOURCES = 'js_too_many_sources',
  JS_INVALID_SOURCE_ENCODING = 'js_invalid_source_encoding',
  JS_INVALID_SOURCEMAP_LOCATION = 'js_invalid_sourcemap_location', // deprecated
  JS_INVALID_STACKFRAME_LOCATION = 'js_invalid_stackframe_location',
  JS_TOO_LARGE = 'js_too_large',
  JS_FETCH_TIMEOUT = 'js_fetch_timeout',
  JS_SCRAPING_DISABLED = 'js_scraping_disabled',
}
