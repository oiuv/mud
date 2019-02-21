
string chinese_number(int i)
{
	return CHINESE_D->chinese_number(i);
}

string to_chinese(string str)
{
	return CHINESE_D->chinese(str);
}

int is_chinese(string str)
{
	int i;

	if( strlen(str) < 2 ) return 0;

	for( i= 0; i < strlen(str); i++)
	{
		if( str[i] < 161 || str[i] == 255 ) return 0;
		if( !(i%2) && (str[i] < 176 || str[i] >= 248) ) return 0;
	}

	return 1;
}

