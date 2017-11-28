// build.c
// created by doing

#include <getconfig.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        if (! SECURITY_D->valid_grant(me, "(arch)"))
        {
		write("你没有权限编译" + LOCAL_MUD_NAME() + "的版本。\n");
                return 1;
        }

        if (! arg)
                return notify_fail("指令格式: build <路径名> | version | new | cancel\n");

        if (arg == "version")
                return VERSION_D->generate_version();

        if (arg == "cancel")
                return VERSION_D->build_cancel();

        if (arg == "new")
                return VERSION_D->build_new();

        if (arg[0] != '/')
                return notify_fail("你必须输入一个完整的路径名才可以。\n");

        return VERSION_D->build_path(arg);
}

int help (object me)
{
        write(@HELP
指令格式: build <路径名> | version | cancel | new

编译生成用于发布的MUDLIB版本，如果输入了路径名，就更新当前版
本的某一个路径。更新路径名的方式将无条件覆盖版本目录下的文件。

build version 生成当前MUDLIB的最新发布版本。
build cancel  终止当前生成版本的操作，恢复以前的版本信息。
build /       强行从新覆盖版本目录下的所有文件。
build new     生成新的版本号。

注意，build cancel是一个破坏数据完整性的操作，因为这个操作本
身并不能恢复应该被覆盖的版本。在使用了build cancel以后，建议
运行build / 以重新生成所有版本。

build new 则是配合build <路径名>使用的，当分别更新了一些路径
以后，有必要生成一个新的版本号，已备其他站点自动更新。

HELP );
        return 1;
}
