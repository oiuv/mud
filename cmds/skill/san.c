// 圣化

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object item;

        if (! arg) return notify_fail("你要圣化什么物品？\n");

        if (! objectp(item = present(arg, me)))
                return notify_fail("你身上没有这种物品。\n");

        notify_fail(item->name() + "没有办法被圣化。\n");

        // 圣化物品
        return item->do_san(me);
}

int help(object me)
{
write(@HELP
指令格式 : san <物品名称>
 
这个指令可以让你圣化某样物品。当然，这件物品得能够圣化才可以，
而且你需要有足够充沛的内力和相当多的精力。圣化以后你会损失一
些内力和精力的上限。

值得注意的是：圣化时如果你的内力水平没有充分锻炼到你目前的极
限，则圣化将会有一定的危险，有可能导致你的基本内功受到损伤。
因此在圣化前保证自己的内力接近瓶颈值是可靠的做法。
HELP
    );
    return 1;
}
