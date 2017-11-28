#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "广场");
        set("long", @LONG
山路行到这里，忽然变得开阔，你眼前出现了一片很大的广场。一些铁
掌帮的弟子来回穿梭于其间，显得很忙碌。在广场的周围有很多岩石建的房
子。正面的这间尤其显得高大雄伟。左面的房子中不时的涌出阵阵热气，其
间还加杂着鼓风的声音。
LONG    );
        set("exits", ([
                "south" : __DIR__"shanlu-2",
                "west" : __DIR__"lgfang",
                "east" : __DIR__"guajia",
                "northup" : __DIR__"wztang",
        ]));

        set("objects", ([
                __DIR__"npc/huiyi" : 1,
                __DIR__"npc/heiyi" : 2,
                CLASS_D("tiezhang") + "/fen" : 1,
        ]));

        set("valid_startroom", 1);
        set("no_clean_up", 0);
        set("outdoors", "tiezhang");

        setup();

        "/clone/board/tiezhang_b"->foo();
}

int valid_leave(object me, string dir)
{
//      int i;
//      object ob;
        me = this_player();
        if(dir == "northup")
        {
                if ( (string)me->query("family/family_name") != "铁掌帮"
                   & objectp(present("feng yong", environment(me)))
                   & ! me->query("move_party/绝情谷—铁掌帮", 1) )
                        return notify_fail(CYN "冯勇身形一晃，忽然挡住你，厉声说道：这位" +
                                           RANK_D->query_respect(me) + CYN "不是本帮弟子，"
                                           "休得在本帮乱闯。\n" NOR);
        }
        return ::valid_leave(me, dir);
}