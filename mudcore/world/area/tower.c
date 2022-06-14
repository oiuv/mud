/**
 * @file tower.c
 * @author 雪风@Mud.ren
 * @brief 单文件环境示例，结合虚拟对象实现无限高度
 * @version 0.1
 * @date 2021-12-05
 *
 * @copyright Copyright (c) 2021
 *
 */
#include <ansi.h>

inherit CORE_STD_ROOM;

varargs void create(int x, int y, int z)
{
    set("short", "勇者之塔");
    set("long", "这里是勇者之塔第 " + z + " 层，塔内每一层都封印着一种魔物，成为勇者们试练的好地方，很多冒险者都来挑战记录，想成为传说中的勇者。");
    set("exits", ([
        "up":__DIR__ "tower/" + x + "," + y + "," + (z + 1),
    ]));

    if (!random(10))
    {
        set("long", "这里是勇者之塔第 " + z + " 层内部，在这有一座闪耀着白光的传送门，你可以使用它传送出去（out）。");
        addExit("out", VOID_OB);
    }

    setArea("tower", x, y, z);
}

/**
 * 游戏刷新魔物设置
 */
void init()
{
}

int valid_leave(object me, string dir)
{
    int storey = me->query("tower"), z = query("zone")["z"];

    if (z > storey)
    {
        me->set("tower", z);
        if (!(z % 10))
        {
            CHANNEL_D->do_channel(this_object(), "msg", sprintf("恭喜 %s 突破勇者之塔第 %d 层。", me->short(), z));
        }
    }

    return ::valid_leave(me, dir);
}
