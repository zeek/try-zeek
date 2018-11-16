from setuptools import setup

setup(name='trybro',
    version='0.2.0',
    zip_safe=True,
    py_modules = ["trybro"],
    install_requires='requests',
    entry_points = {
        'console_scripts': [
            'trybro = bro:main',
        ]
    }
)
