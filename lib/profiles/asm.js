/**
 * @file lib/profiles/gcc.js
 * The compiler profile for GNU's C compiler.
 */

const compileCommand = (source, object, options) => {
  // Program and Initial Flags
  const program = 'arm-none-eabi-g++';
  const flags = [        
        '-c',
        '-O2',
        //'-g',
        
        '-mtune=cortex-m4',
        '-mcpu=cortex-m4',
        '-mapcs-frame',
        '-march=armv7e-m',
        '-mfloat-abi=hard',
        '-mfpu=fpv4-sp-d16',  


        '-Wall',
        '-Wextra',
        '-pipe',
        
  		'-fvisibility=default',
		'-x',
		'assembler',

        //'-std=gnu11',
        //'-fno-hosted',
        //'-Wno-old-style-declaration',
        //'-fomit-frame-pointer',        
        '-gdwarf-2',



        '-Wno-missing-field-initializers',
        '-Wno-unused-parameter',
        '-Wno-sign-compare',
        '-Wno-comment',
        '-Wno-switch',

        '-fno-delete-null-pointer-checks',
        '-fno-strict-aliasing',
        '-ffunction-sections',
        '-fmessage-length=0',
        '-fdata-sections',
        '-fsigned-char',
        '-fno-builtin',
        '-ffast-math',

        '-mno-sched-prolog',
        '-mthumb',

        '-nostdlib',
        '-MMD'
    ];

  // Additional Flags
  if (options.buildOutput === 'shared-library') flags.unshift('-fPIC');
  if (options.isDebugMode === true) flags.push('-g');

  // Define Flags
  const defines = options.defines || [];
  const defineFlags = defines.map(d => `-D${d}`);

  // Include Flags - The include directories should already be resolved.
  const includes = options.includes || [];
  const includeFlags = includes.map(i => `-I${i}`);

  // Output Flag
  const outputFlag = '-o';

  // Return an object with the program name and the combined list of arguments
  // as an array to be passed into our spawner function.
  return {
    program,
    args: [
      ...flags,
      ...defineFlags,
      ...includeFlags,
      source,
      outputFlag,
      object
    ]
  };
};

const executableLinkCommand = (linkscripts, objects, target, options) => {
  const program = 'arm-none-eabi-gcc';
  const flags = [        
  	'-g',
  	'-O2',
  	'-Wall',
  	'-Wextra',
  	
  	'-mcpu=cortex-m4',
    '-march=armv7e-m',
    '-mfloat-abi=hard',
    '-mfpu=fpv4-sp-d16',
    
    '-mthumb',
    '-fmessage-length=0',
    '-ffunction-sections',
    '-fdata-sections',
    '-fsigned-char',
    '-Wall',
    '-Wextra',
    '-g3',
    '-Xlinker',
    '--gc-sections',
    '-Wl,--wrap=main',
    '--specs=nano.specs',
    '-Wl,--unresolved-symbols=ignore-in-shared-libs',
  ];

  const libraryPaths = options.libraryPaths || [];
  const libraryFlags = libraryPaths.map(l => `-L${l}`);

  const linkLibraries = options.linkLibraryFlags || [];
  const linkLibraryFlags = linkLibraries.map(l => `-l${l}`);

  const linkscriptFiles = linkscripts.map(l => `-T${l}`);

  const outputFlag = '-o';

  return {
    program,
    args: [...flags, ...objects, ...libraryFlags, ...linkLibraryFlags, linkscriptFiles, outputFlag, target]
  };
};

const staticLinkCommand = (objects, target, options) => {
  const program = 'arm-none-eabi-ar';
  const flags = ['rcs'];

  return {
    program,
    args: [...flags, target, ...objects]
  };
};

const dynamicLinkCommand = (objects, target, options) => {
  const program = 'arm-none-eabi-gcc';
  const flags = ['-shared'];

  const libraryPaths = options.libraryPaths || [];
  const libraryFlags = libraryPaths.map(l => `-L${l}`);

  const linkLibraries = options.linkLibraryFlags || [];
  const linkLibraryFlags = linkLibraries.map(l => `-l${l}`);

  const outputFlag = '-o';

  return {
    program,
    args: [
      ...flags,
      ...objects,
      ...libraryFlags,
      ...linkLibraryFlags,
      outputFlag,
      target
    ]
  };
};

module.exports = {
  compileCommand,
  executableLinkCommand,
  staticLinkCommand,
  dynamicLinkCommand
};
