#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIB "阴阳塔" NOR);
        set("long", HIB @LONG
这是地狱中最高的一座塔，高约三百余尺，共有十八级。这里就是
塔顶，塔顶有个供奉台(stone)，传说有神兽朱雀路过。
LONG NOR
        );

        set("exits", ([
                "down" : __DIR__"yinyangta17",
        ]));

        set("item_desc", ([
                "stone" : HIW "\n上面好象可以放(put)物品。\n" NOR,
        ]));
                
        set("objects",([
                // __DIR__"npc/zhuque" : 1,
        ]));
        set("zhuque", 1);
        
        setup();
}

void init()
{
        object me;
        me = this_player();

        add_action("do_fang", "put");
        add_action("do_fang", "fang");
}

int do_fang(string arg)
{
        object me = this_player();
        object ob;
        object ob1;


        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");
                
        if (objectp(present("zhu que", environment(me))))
                return notify_fail("朱雀已经现身了，还寻什么呀，赶快战斗吧！\n");

        if (query("zhuque") < 1)
                return notify_fail("朱雀已经被宰了，你再怎么寻也是寻不到的！\n");

        if (arg != "qise yingluo")
                return notify_fail("你必须放上至宝七色璎珞，才能招引神兽朱雀！\n");
                                
        if (! objectp(ob = present("qise yingluo", me)))
                return notify_fail("你身上没有至宝七色璎珞！\n");               
        
        destruct(ob);
        message_vision(HIC "\n$N" HIC "你小心翼翼的将至宝七色璎珞放到供奉台，开始目不转睛的寻找朱雀。\n" NOR, me); 
        
        ob1 = new("/d/death/npc/zhuque");
        ob1->move(environment(me));
        message_vision(HIC "\n神兽朱雀受到至宝七色璎珞的招引，突然出现在供奉台，你顿时大喜！\n" NOR, me);         
        
        return 1;
}
 
