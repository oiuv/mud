inherit ROOM;

#include <ansi.h> 

int do_take(string arg);

void create()
{
        set("short", "冰车");
        set("long", @LONG
这里是凌霄城的冰车 (che)下山之处，此冰车是凌霄城为了
能直达山脚，所特制而成，能从这雪山之巅飞速滑下，是从雪山
去往山下的交通工具。你可以乘坐(take)它下山。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            "east"  : __DIR__"iceroad3",
        ])); 
        set("objects", ([
                __DIR__"npc/dizi" : 1,
        ])); 

        set("item_desc", ([
        	"che": "一台以上好的红杉木所制的冰车，是凌霄弟子下山之用。\n"
        ]) );
        setup();
}
  
void init()
{
        add_action("do_take", "take");
}


int do_take(string arg)
{
        object me = this_player();

        if (! arg || arg != "che" )
                return notify_fail("你要坐什么？\n");

        if (me->query("family/family_name") != "凌霄城")
                return notify_fail(CYN "凌霄弟子道瞟了你一眼，冷笑道：你自个没长"
                                   "腿，非要大爷我服侍你不成？\n" NOR);

        message_vision(HIW "\n$N" HIW "稳稳当当坐上冰车，向凌霄弟子打个手势。那"
                       "弟子点了点头，将\n开关一扳，冰车就如离弦之箭，向下飞射而"
                       "出。顿时只见万里雪山\n在$N" HIW "身边逝过，如白驹之逝，"
                       "飞翼之行。$N" HIW "心神大快，忍不住纵声\n长啸。不一会儿"
                       "，$N" HIW "乘座的冰车已滑到了山脚之下。\n\n" NOR,
                       this_player());

        me->move("/d/xuedao/sroad1");
        tell_object(me, HIC "你顺利的到达了山脚下！\n" NOR);

        message("vision", HIW "忽见从山涧中急速滑下一只冰车，停至山脚之下。一人"
                          "轻身一纵，跃出冰车，身法甚是矫健！\n" NOR,
                          environment(me), ({ me }));

        return 1;
}

