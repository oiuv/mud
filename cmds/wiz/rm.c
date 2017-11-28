// rm.c
// created by doing

#include <ansi.h>
 
inherit F_CLEAN_UP;
 
private int rm_item(string file, int rm_dir);
int rm_dir(string dir);
int help(object me);

int main(object me, string arg)
{
        string file;
        string dir;
        int rm_dir;
        int count;
        string path;
        mixed flist;
        int i;
 
        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

        seteuid(geteuid(me));
 
        if (! arg)
        {
                help(me);
                return 1;
        }

        if (sscanf(arg, "-R %s", dir) == 1)
        {
                if (me && ! is_root(me))
                {
                        write("只有管理员才能使用 -R 参数。\n");
                        return 1;
                }

                if (strsrch(dir, "*") != -1)
                {
                        write("为了安全起见，使用 -R 的参数的时候不能使用通配符。\n");
                        return 1;
                }

                if (dir == "/")
                {
                        write("你不能删除根目录。\n");
                        return 1;
                }

                rm_dir = 1;
        } else
        {
                dir = arg;
                rm_dir = 0;
        }

        file = resolve_path(me->query("cwd"), dir);
        flist = get_dir(file);
        if (arrayp(flist)) flist -= ({ ".", ".." });
        if (! arrayp(flist) || ! sizeof(flist))
        {
                write("没有这个文件。\n");
                return 1;
        }

        path = "";
        while ((i = strsrch(file, "/")) != -1)
        {
                path += file[0..i];
                file = file[i + 1..<1];
        }

        if (rm_dir)
        	message_system(HIR "删除目录中，请稍候..." NOR),

        count = 0;
        for (i = 0; i < sizeof(flist); i++)
        {
                count += rm_item(path + flist[i], rm_dir);
        }

        if (count)
                write(HIY "总共有" + count + "个文件被成功删除。\n" NOR);
        else
                write("没有删除任何文件。\n");
        return 1;
}

private int rm_item(string file, int rm_dir)
{
        switch (file_size(file))
        {
        case -1:
                write("没有这个文件。\n");
                return 0;

        case -2:
                if (rm_dir)
                        return rm_dir(file);

                if (rmdir(file))
                        write("成功的删除了目录(" + file + ").\n");
                else
                        write("你没有删除该目录的权限或者试图删除一个"
                              "非空的目录(" + file + ")。\n");
                return 0;
                
        default:
                if (rm(file))
                        return 1;

                write("你没有删除(" + file + ")的权限。\n");
                return 1;
        }
}
 
int rm_dir(string dir)
{
        mixed *file;
        int count;
        int i;

        if (! is_root(previous_object()))
                return 0;

        count = 0;
        if (dir[strlen(dir) - 1] != '/') dir += "/";
        file = get_dir(dir, -1);

	i = sizeof(file);
	while (i--)
        {
		reset_eval_cost();
		if (file[i][1] != -2)
                        if (rm(dir + file[i][0]))
                                count++;
	}

	i = sizeof(file);
	while (i--)
        {
		reset_eval_cost();
		if (file[i][1] == -2)
                        count += rm_dir(dir + file[i][0]);
        }

        write (HIC "删除目录(" + dir + ")。\n" NOR);
        rmdir(dir);
	return count;
}

int help(object me)
{
        write(@HELP
指令格式 : rm [-R] 档案名
 
此指令可让你删除某个档案或目录。如果使用了-R参数，可以删除非空的目
录，使用该参数务必要小心，以免删除错路径。

see also: cp, mv
HELP );
    return 1;
}
