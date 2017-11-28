#include <ansi.h>
#include <room.h>
inherit ROOM;

void init()
{
        add_action("do_zha", "zha");
}

void create()
{
        set("short", "石矿");
        set("long", @LONG
这里郊外一座荒山，怪石嶙峋，在山的另一边不断传来一阵阵的爆炸声，原
来已经有很多人在那边炸(zha)山开采矿石。
LONG );
        set("outdoors","city");
        set("exits", ([
                "northup"  : "/d/jingzhou/shikuang1",
        ]));
        set("no_fight", 1);
        set("no_sleep_room",1);
        set("no_clean_up", 0);
        setup();
}

int do_zha(string arg)
{
        object me;
        me = this_player();

        if( !present("lei guan", me))
                return notify_fail(HIY"你要做什么？\n"NOR);

        if( (!arg) || !((arg == "山") ))
                return notify_fail(CYN"你拿着雷管没事干呀！\n"NOR);

        if( me->query_temp("caiend") == 1 )
                return notify_fail(HIR"这里已经被你炸平了，还想来破坏环境呀？\n"NOR);

        if( me->query("zha/山") == 1 )
                return notify_fail(HIM"雷管已经点燃了，你还要干什么？\n"NOR);

        if( me->is_busy()) 
                return notify_fail("你正忙着呢！！\n");

        if( (me->query("qi")<25) || (me->query("jing")<25) )
                return notify_fail(MAG"你太累了，赚钱也不急在一时。\n"NOR);
        
        if( me->query_temp("caistone") == 1 ) {
        message_vision(HIW"$N笨手笨脚地找了个缝隙把雷管插进去，手忙脚乱地点燃了就溜！\n"NOR, me);
        remove_call_out("zha/山");
        me->set("zha/山", 1);
        call_out("bao", random(5) +5, me );
        return 1;
        }
        else {
                return notify_fail(HIY"没事来捣乱呀！快滚！\n"NOR);
        }
}

int valid_leave(object me, string dir)
{
        if ( dir == "northup" && me->query_temp("zha/山") == 1)
                return notify_fail(HIW"你的雷管还插在那里，想留下来害人吗？\n"NOR);
        return 1;
}

void bao()
{
        object me, obj, cor, cps, dex, guan;
        me = this_player();
        guan = present("lei guan", me);
        cor = me->query("cor");
        cps = me->query("cps");
        dex = me->query("dex");
        
        me->delete("zha/山");
        
        if ( me->query("dex") < random(25) + 5){
        message_vision(HIR"只听到“轰”的一声巨响，$N整个人飞了出去，原来爆炸力太强了，把自己都炸伤了。\n"NOR,me);
        me->receive_damage("qi", random(40)); 
        me->receive_damage("jing", random(40)); 
        me->start_busy(random(10) +5);
        return;
}       
        if ( me->query("cor") < random(25) + 5){
        message_vision(HIY"只听到“轰”的一声巨响，却只有一些碎石滚下来，原来爆炸力太小了。\n"NOR,me);
        me->receive_damage("qi", random(10)); 
        me->receive_damage("jing", random(20)); 
        me->start_busy(random(5) +3);
        return;
}       
        if ( me->query("cps") < random(25) + 5){
        message_vision(BLU"$N闭着眼睛、捂着耳朵等了老半天，却什么都没发生，原来雷管受潮死火了。\n"NOR,me);
        me->receive_damage("qi", random(10)); 
        me->receive_damage("jing", random(10)); 
        me->start_busy(random(8) +3);
        return;
}

else {
        message_vision(HIC"只听到“轰”的一声巨响，一块大石从山上滚了下来。\n"NOR,me);
        me->delete_temp("caistone");
        me->set_temp("caiend", 1);
        destruct(guan);
        obj = new("/clone/misc/bigstone");
        obj->move(this_player());
        message_vision(MAG"$N连忙抬起那块大石，生怕别人抢了他的劳动成果！！！\n"NOR, me);
        me->receive_damage("qi", random(10)); 
        me->receive_damage("jing", random(10));
        me->start_busy(random(3) +3);
     }
}
