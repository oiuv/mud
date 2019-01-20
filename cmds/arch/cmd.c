inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object  me,  string  arg)
{
//	string str;
	object *list;
	int i, j, threshold;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg || ! sscanf(arg, "%d", threshold))
	        threshold=0;

        list = users();

        i = sizeof(list);
	for (j = 0; j < i; j++)
                if(list[j]->query_cmd_count()>threshold)
	                write(sprintf("%10s    %5d\n",list[j]->query("id"),
	                      list[j]->query_cmd_count()));
	return  1;
}

int  help(object  me)
{
write(@HELP
Ö¸Áî¸ñÊ½  :  cmd  [threshold]

List the average number of commands a player typed per second recently.
If a "threshold" is given, only number > threshold will be shown.

HELP );
        return  1;
}