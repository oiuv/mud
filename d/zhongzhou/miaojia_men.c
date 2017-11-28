#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "苗家大门");
	set("long",
"这是一座颇为巨大的宅院，看样子是富人的居所。门前摆
着两座石狮，甚是威严。红漆大门上悬挂着块匾，上面写着有

          " YEL "※※※※※※※※※※※※※※※※※
          ※                              ※
          ※  " HIR "打  遍  天  下  无  敌  手" NOR YEL "  ※
          ※                              ※
          ※※※※※※※※※※※※※※※※※" NOR "

七个镶金大字。大门中央站着一位四十来岁的瘦高个子，手里
持着一副铁灵牌，冷冷地望着你。\n");

	set("exits", ([
  		"east"  : __DIR__"miaojia_dayuan",
  		"west"  : __DIR__"wendingbei4",
	]));

	set("no_clean_up", 0);
	set("objects", ([
                CLASS_D("miao") + "/wen" : 1,
	]));

	setup();
}

int valid_leave(object me, string dir)
{
        object wen;

        if (dir != "east" ||
            ! objectp(wen = present("zhong zhaowen", this_object())))
                return ::valid_leave(me, dir);

        return wen->permit_pass(me, dir);
}
