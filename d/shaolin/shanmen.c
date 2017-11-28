// Room: /d/shaolin/shanmen.c
// Date: YZC 96/01/19

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "少林寺");
    set("long", @LONG
一个巨大的牌坊横架在两片山壁之间，牌坊正上方刻着三个
斗大的字：『少林寺』。字迹有些剥落，看上去年代久远。两位
三十来岁的僧人手持戒刀守在山门两侧。左侧立着一块石碑。
LONG );
    set("exits", ([
        "eastup" : __DIR__"shijie8",
        "west" : __DIR__"shijie7",
    ]));
    set("outdoors", "shaolin");
    set("objects",([
        CLASS_D("shaolin") + "/xu-tong" : 1,
        CLASS_D("shaolin") + "/xu-ming" : 1,
    ]));
    setup();
}

int valid_leave(object me, string dir)
{
    object *inv;
    mapping myfam/*, mygen*/;
    int i;

    if (me->query("gender") == "女性" && dir == "eastup" ) {
        if(objectp(present("xu tong", environment(me))))
            return notify_fail("虚通伸手拦住你白眼一翻说道：千年以来，少林向不许"
                "女流擅入。" + RANK_D->query_respect(me) +"\n请下山去吧，免得"
                "自讨没趣。\n");
        else if(objectp(present("xu ming", environment(me))))
            return notify_fail("虚明迈步挡在你身前，双手合什说道：阿弥陀佛，"
                "这位" + RANK_D->query_respect(me) + "请留步，\n恕小寺不接待女"
                "客。女施主倘若一心向佛，何妨去峨眉山随喜？\n");
    }

    myfam = (mapping)me->query("family");

    if ((!myfam || myfam["family_name"] != "少林派" ) && dir == "eastup") {
        inv = all_inventory(me);
        for(i=sizeof(inv)-1; i>=0; i--)
            if(inv[i]->query("weapon_prop") && inv[i]->query("skill_type") &&
               inv[i]->query("equipped"))
                if(objectp(present("xu tong", environment(me))))
                    return notify_fail("虚通拦住你说道：这位" +
                        RANK_D->query_respect(me) + "请放下兵刃。少林千年的"
                        "规矩，外客\n不得持兵刃上山。\n");
                else if(objectp(present("xu ming", environment(me))))
                    return notify_fail("虚明迈步挡在你身前，双手合什说道：阿"
                        "弥陀佛，这位" + RANK_D->query_respect(me) + "请收起"
                        "\n兵刃。佛门清静之地，不便随意舞刀弄剑。还请施主鉴"
                        "谅。\n");
    }
    return ::valid_leave(me, dir);
}