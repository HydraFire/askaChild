set x=0
set /a x=x+%1


if not %x%==1 (
	start /min askaChild.bat 1
	exit
	)


npm start

