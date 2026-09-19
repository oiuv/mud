#include <ansi.h>

inherit ROOM;

void create() {
    set("short", "山门");
    set("long", @LONG
这里就是江湖上闻风丧胆的“铁掌帮”。自从“铁掌歼衡山”一役将衡
山派打得一蹶不振之后，帮主铁掌水上漂的名头威震江湖。这里是进山的必
经之路，曲的小路通向山里。路的一侧立着一块牌子(paizi) 。两旁的树林
内不时传出一些响声，似乎有人在暗中监视。
LONG);
    set("outdoors", "tiezhang");
    set("exits", ([ /* sizeof() == 2 */
        "northup": __DIR__ "shanlu-1",
        "southdown": __DIR__ "shanjiao",
    ]));
    set("objects", ([ /* sizeof() == 2 */
        __DIR__ "npc/heiyi": 2,
    ]));
    set("item_desc", ([ /* sizeof() == 1 */
        "paizi": "[31m“擅入者--死”
[0;37;0m",
    ]));
    set("no_clean_up", 0);

    setup();
}

int valid_leave(object me, string dir) {
    mapping myfam;
    myfam = (mapping)me->query("family");

    if ((!myfam || myfam["family_name"] != "铁掌帮") && dir == "northup" && (int)me->query(
        "combat_exp",
        1
    ) >= 10000 &&
        objectp(present("heiyi bangzhong", environment(me))))
        return notify_fail(CYN "黑衣帮众抽刀拦住你的去路，说道：“你不是铁掌帮弟子，不能上山！\n" NOR);

    return ::valid_leave(me, dir);
}
