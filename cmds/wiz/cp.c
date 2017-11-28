// cp.c
// created by Doing

#include <ansi.h>

inherit F_CLEAN_UP;

int copy_dir(string src, string dst, int dir_existed);
int help(object me);

// value of call parameter
#define DIR_EXISTED             1
#define DIR_MAY_NOT_EXISTED     0

int main(object me, string arg)
{
        string *fn;
        string src, dst;
        int copy_dir;
        int count;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	 seteuid(geteuid(me));

        if (! wizardp(me))
                return notify_fail("你没有权限使用 cp 命令。\n");

        if (! arg)
        {
                help(me);
                return 1;
        }

        if (sscanf(arg, "-R %s %s", src, dst) == 2)
        {
                if (me && ! is_root(me))
                {
                        write("只有管理员才能使用 -R 参数。\n");
                        return 1;
                }

                copy_dir = 1;
        } else
        if (sscanf(arg, "%s %s", src, dst) == 2)
        {
                copy_dir = 0;
        } else
        {
                write("格式错误！\n");
                help(me);
                return 1;
        }

        src = resolve_path(me->query("cwd"), src);
        dst = resolve_path(me->query("cwd"), dst);

        switch (file_size(src))
        {
        case -1:
                write("没有这个(" + src + ")文件或目录，无法复制。\n");
                return 1;

        case -2:
                if (copy_dir) break;
                write("没有指定 -R 参数，不能复制目录(" + src + ")。\n");
                return 1;
        default:
                // copy file, not directory.
                copy_dir = 0;
                break;
        }

        if (! copy_dir)
        {
                if (file_size(dst) == -2)
                {
                        // destination is a directory
                        fn = explode(src, "/");
                        dst += "/" + fn[sizeof(fn) - 1];
                        fn = 0;
                }

                if (cp(src, dst))
                        write("Ok.\n");
                else
        		write("你没有足够的读写权利。\n");
                return 1;
        }

        if (strlen(dst) >= strlen(src) && dst[0..strlen(src) - 1] == src)
        {
                write("你不能将一个路径复制到自身或者是子路径中。\n");
                return 1;
        }

        switch (file_size(dst))
        {
        case -2:
                // destination is a directory
                fn = explode(src, "/");
                dst += "/" + fn[sizeof(fn) - 1];
                fn = 0;
                break;
        case -1:
                // no destination
                break;

        default:
                // destition is a file, error
                write("目录不能复制到文件内，请修正你的目的路径。\n");
                return 1;
        }

	message_system(HIC "复制目录中，请稍候..." NOR);

        count = copy_dir(src, dst, DIR_MAY_NOT_EXISTED);
        if (count)
                write(HIY "总共有" + count + "个文件被成功复制。\n" NOR);
        return 1;
}

int copy_dir(string src, string dst, int dir_existed)
{
        mixed *file;
        int count;
        int i;

        if (! is_root(previous_object()))
                return 0;

        count = 0;
        if (src[strlen(src) - 1] != '/') src += "/";
        if (dst[strlen(dst) - 1] != '/') dst += "/";

        // assure dst existed
        if (! dir_existed) assure_file(dst);

        file = get_dir(src, -1);
	if (! sizeof(file))
                return count;

        write (HIC "复制目录(" + src + ") -- > (" + dst + ")。\n" NOR);
	i = sizeof(file);
	while (i--)
        {
		reset_eval_cost();
		if (file[i][1] != -2)
                        if (cp(src + file[i][0], dst + file[i][0]))
                                count++;
	}

	i = sizeof(file);
	while (i--)
        {
		reset_eval_cost();
		if (file[i][1] == -2)
                {
                        mkdir(dst + file[i][0]);
                        count += copy_dir(src + file[i][0],
                                          dst + file[i][0],
                                          DIR_EXISTED);
                }
        }
	return count;
}

int help(object me)
{
        write(@HELP
指令格式 : cp [-R] <文件|路径名> <目的文件|目的路径名>
 
这个指令可以复制源文件成目的文件或复制到目的路径。如果使用了参数-R则
可以复制一个目录，没有这个参数则不能复制路径。

see also: rm, mv
HELP );
        return 1;
}
