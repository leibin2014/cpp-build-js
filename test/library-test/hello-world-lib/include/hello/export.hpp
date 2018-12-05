/**
 * @file hello/export.hpp
 */

#pragma once

#if defined(_WINDOWS) || defined(_WIN32)
#define _HELLO_WINDOWS
#define _HELLO_DIRECTORY_SEPARATOR "\\"
#if defined(_HELLO_BUILDING)
#define _HELLO_API __declspec(dllexport)
#else
#define _HELLO_API __declspec(dllimport)
#endif
#else
#define _HELLO_UNIX
#define _HELLO_DIRECTORY_SEPARATOR "/"
#if defined(__GNUC__) && __GNUC__ >= 5
#if defined(_HELLO_BUILDING)
#define _HELLO_API __attribute__((visibility("default")))
#else
#define _HELLO_API
#endif
#endif
#endif
