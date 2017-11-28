// nick.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	if (! arg)
		return notify_fail("你要替自己取什么绰号？\n");

	if (arg == "none")
	{
		me->delete("nickname");
		write("你的绰号取消了。\n");
		return 1;
	}

	if (strlen(arg) > 80)
		return notify_fail("你的绰号占用的资源过多，请重新设置。\n");

	arg = replace_string(arg, "$BLK$", BLK);
	arg = replace_string(arg, "$RED$", RED);
	arg = replace_string(arg, "$GRN$", GRN);
	arg = replace_string(arg, "$YEL$", YEL);
	arg = replace_string(arg, "$BLU$", BLU);
	arg = replace_string(arg, "$MAG$", MAG);
	arg = replace_string(arg, "$CYN$", CYN);
	arg = replace_string(arg, "$WHT$", WHT);
	arg = replace_string(arg, "$HIR$", HIR);
	arg = replace_string(arg, "$HIG$", HIG);
	arg = replace_string(arg, "$HIY$", HIY);
	arg = replace_string(arg, "$HIB$", HIB);
	arg = replace_string(arg, "$HIM$", HIM);
	arg = replace_string(arg, "$HIC$", HIC);
	arg = replace_string(arg, "$HIW$", HIW);
	arg = replace_string(arg, "$NOR$", NOR);

	if (strlen(filter_color(arg)) > 30)
		return notify_fail("你的绰号太长了，想一个短一点的、响亮一点的。\n");

	me->set("nickname", arg + NOR);
	write("你取好了绰号。\n");
	return 1;
}
int help(object me)
{
        write(@HELP
指令格式 : nick <外号, 绰号> | none
 
这个指令可以让你为自己取一个响亮的名号或头衔，你如果希望在绰号中
使用 ANSI 的控制字元改变颜色，可以用以下的控制字串：

$BLK$ - 黑色		$NOR$ - 恢复正常颜色
$RED$ - 红色		$HIR$ - 亮红色
$GRN$ - 绿色		$HIG$ - 亮绿色
$YEL$ - 土黄色		$HIY$ - 黄色
$BLU$ - 深蓝色		$HIB$ - 蓝色
$MAG$ - 浅紫色		$HIM$ - 粉红色
$CYN$ - 蓝绿色		$HIC$ - 天青色
$WHT$ - 浅灰色		$HIW$ - 白色
 
其中系统自动会在字串尾端加一个 $NOR$。

HELP );
        return 1;
}
