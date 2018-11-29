from setuptools import setup

setup(name='tryzeek',
    version='0.2.0',
    zip_safe=True,
    py_modules = ["tryzeek"],
    install_requires='requests',
    entry_points = {
        'console_scripts': [
            'tryzeek = tryzeek:main',
        ]
    }
)
