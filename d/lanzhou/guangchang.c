#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "中央广场");
        set("long", @LONG
这里是兰州城的中央广场。由于兰州是西北地区的交通要
道，不论到西域还是中原都要经过这里，所以各地的行人来来
往往，你不时还可以看见一些来自西域的商人带着驼队匆匆向
东走去。这里是城市的正中心，有一个很宽阔的广场，由于这
里风沙很大，所以铺着青石的地面经常铺着一层黄沙。一些游
手好闲的人在这里溜溜达达，经常有一些西域艺人在这里表演。
由于这里是由中原到西域的最后一个大城，各地的旅人都在这
里进行最后的补给。这里人声鼎沸，许多小贩争着向行人兜售
着自己的商品，一派热闹景象。
LONG);
        set("no_sleep_room",1);
        set("outdoors", "lanzhou");
        set("exits", ([
                "east"   : __DIR__"dongdajie1",
                "south"  : __DIR__"nandajie1",
                "west"   : __DIR__"xidajie1",
                "north"  : __DIR__"beidajie1",
        ]));
        set("objects", ([
                "/d/beijing/npc/maiyi2" : 1,
                "/d/beijing/npc/haoke1" : 2,
        	__DIR__"npc/liumangtou" : 1,    
        	__DIR__"npc/xiaofan" : 1,
                "/clone/npc/walker" : 1,
        ]));
        setup();
}

void init()
{
       add_action("do_zuan", "zuan");

}

int do_zuan(string arg)
{
       object me = this_player();

       if (me->is_busy() || me->is_fighting())
              return notify_fail("等你忙完了再说吧！\n");
 
       if (me->query("family/family_name") != "明教")
              return notify_fail("什么？\n");

       me->start_busy(1);

       write(HIC "你趁人不注意，悄悄地钻进地道。\n" NOR);

       me->move("/d/mingjiao/didao2");

       return 1;
}