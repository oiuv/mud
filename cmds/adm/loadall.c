
inherit F_CLEAN_UP;
int help(object me);
int loadall(string dir );

int main(object me, string dir)
{
	if(!dir) dir="/";
	if(dir[<1]!='/') dir+="/";
	if(file_size(dir)!=-2)
		return notify_fail(dir+"not exist。\n");
	log_file("loadall", "\n#check dir :" + dir );
	write("check dir "+dir+"\n" );
	if(loadall(dir))
    return 1;
}

int loadall(string dir )
{
	  string file,err,*dirs;

    if(!arrayp(get_dir(dir)))
		return 1;
	  dirs=get_dir(dir);
	  if(dir=="/")
	    dirs = dirs-({".git", "backup", "bin", "binaries", "cygdrive", "data", "dev", "doc", "dump", "grant", "help", "log", "proc", "temp", "u", "version"});

	foreach(file in dirs)
	{
		if( member_array(file,({"simul_efun","event"})) > -1 )
		continue;

		reset_eval_cost();
		switch(file_size(dir+file))
		{
			case -1:
				//无法读取该目录，跳过
				break;
			case -2:
				if(file!="."&&file!="..")
					call_out("loadall",1,dir+file+"/");
				break;
			default:

				if((dir+file)[<2..<1]==".c")
				{
					if(err=catch( load_object(dir+file) ))
						log_file("loadall", "\n	check :"+dir+file+"\n"+ err );

				}
		}
	}
	write("check dir "+dir+" is ok ^_^\n\n");
	return 1;
}
int help (object me)
{
        write(@HELP
    载入某个目录下的所有.c文件(包含子目录)，以查找所有
可能的编译错误。

指令格式： loadall [dir]
比如      loadall /d/city/
没有 dir，则dir默认为 / ，文件太多可能会卡一会。

HELP
        );
        return 1;
}
