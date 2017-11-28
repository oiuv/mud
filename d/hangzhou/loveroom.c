// loveroom.c 相约轩

#include <ansi.h>
#include <room.h>

inherit ROOM;

varargs STATIC_FUNC_TAG void
create_food(string nmstr, string* idlist, string longstr)
{
        object obj;

        obj = new("/d/city/obj/food");
        obj->set_name(nmstr, idlist);
        if (longstr)
              obj->set("long", longstr);
        else
              obj->set("long", "一盘热气腾腾, 香喷喷的"+nmstr+"。\n");
        obj->move(this_object());
}

varargs STATIC_FUNC_TAG void
create_water(string nmstr, string* idlist, string cup, string longstr)
{
        object obj;

        obj = new("/d/city/obj/water");
        obj->set_name(cup, idlist);
        if (longstr)
              obj->set("long", longstr);
        else
              obj->set("long", "一杯可口的" + nmstr + "。\n");
        obj->set("liquid/name", nmstr);
        obj->move(this_object());
}

varargs STATIC_FUNC_TAG void
create_wine(string nmstr, string* idlist, string cup, string longstr)
{
        object obj;

        obj = new("/d/city/obj/wine");
        obj->set_name(cup, idlist);
        if (longstr)
                obj->set("long", longstr);
        else
                obj->set("long", "一杯醇正的" + nmstr + "。\n");
        obj->set("liquid/name", nmstr);
        obj->move(this_object());
}

void create()
{
        set("short", MAG"相约轩"NOR);
        set("long", @LONG
楼外楼的相约轩，四面通窗。湖风拂面，淡淡生暖。远望苏堤一
线，映波，锁澜，望山，压堤，东浦，跨虹六桥断续连沿，烟柳笼纱，
流莺娇啼。近处白堤横亘湖上，堤上杨柳覆地，芳草寒茵如一段碧绸
飘然湖面。室内一张精巧的小桌。桌上一纸精致的菜单(menu)。
LONG
        );
        set("exits", ([ /* sizeof() == 1 */
            "down" : __DIR__"jiulou",
        ]));
        set("sleep_room",1);
        set("item_desc", ([
            "menu": @TEXT
        order party:    浓情幽会    (200两银子)

        order end  :    结束狂欢

        close door  :   关闭房门

        open door   :   打开房门

TEXT
        ]) );
        //create_door("down", "红木雕花门", "up", DOOR_OPENED);
        set("no_clean_up", 0);
        setup();
        set("no_user", 1);
}

void init()
{
        object me;

        add_action("do_order", "order");
        add_action("do_close","close");
        add_action("do_open","open");
        add_action("do_broadcast", "broadcast");
        if (query("order_owner")) {
                me = this_player();
                me->set("food", me->query("food") / 2);
                me->set("water", me->query("water") / 2);
        }
}

int do_broadcast(string arg)
{
        string type;
        string mesg;
        object me;

        me = this_player();
        if (query("order_owner") != me->query("id"))
                return 0;
        type = query("order_type");
        if (type == "party") {
                mesg = me->name() + "在杭州楼外楼和某人幽会！！！\n";
        message("channel:chat", RED+"【江湖通告】"+mesg+NOR, users() );
        message("channel:chat", GRN+"【江湖通告】"+mesg+NOR, users() );
        message("channel:chat", CYN+"【江湖通告】"+mesg+NOR, users() );
        return 1;}
}

int do_order(string arg)
{
        object me, env;
        object* oblist;
        string mesg;
        int idx;

        me = this_player();
        env = this_object();
        mesg = query("order_owner");
        if (mesg && (arg == "end") && (mesg == me->query("id"))) {
                mesg = "幽会终于结束了 !!!!!!\n";
                message("channel:chat", RED+"【江湖通告】"+mesg+NOR, users() );
                delete_temp("plugin");
                delete("order_owner");
                delete("order_type");
                oblist = all_inventory(env);
                for(idx=0; idx<sizeof(oblist); idx++) {
                        if (!objectp(oblist[idx]))
                                continue;
                        if (userp(oblist[idx]))
                                continue;
                        destruct(oblist[idx]);
                }
                return 1;
        }
        if (mesg)
                return notify_fail("这里已经被人包租了.\n");
        notify_fail("你没有足够的钱或零钱不够.\n");
        if (arg == "party") {
                mesg = me->name() + "和某人在杭州楼外楼幽会 !!!!!!\n";
                if (me->can_afford(20000) == 0)
                        return 0;
                me->pay_money(20000);
                create_water(CYN"龙井茶"NOR, ({ "tea" }), MAG"紫砂茶盅"NOR );
                create_water(HIG"碧螺春"NOR, ({ "tea" }), MAG"紫砂盏"NOR );
                create_wine(HIY"绍兴黄酒"NOR, ({ "wine" }), HIW"象牙杯"NOR );
                create_wine(GRN"竹叶青"NOR, ({ "wine" }), HIG"翡翠杯"NOR );
                create_wine(RED"女儿红"NOR, ({ "wine" }), MAG"紫檀杯"NOR );
                create_food(RED"东坡肉"NOR, ({ "pork" }) );
                create_food(HIB"西湖醋鱼"NOR, ({ "fish" }) );
                create_food(HIR"龙井虾仁"NOR, ({ "shrimp" }) );
                create_food(YEL"叫化童鸡"NOR, ({ "chicken" }) );
                create_food(HIR"桂花鲜栗羹"NOR, ({ "guihua geng" }) );
                create_food(HIY"百果油包"NOR, ({ "baozi" }) );
                }
         else {
                return notify_fail("这儿只承办幽会小宴。\n");
        }
        message("channel:chat", RED+"【江湖通告】"+mesg+NOR, users() );
        message("channel:chat", GRN+"【江湖通告】"+mesg+NOR, users() );
        message("channel:chat", CYN+"【江湖通告】"+mesg+NOR, users() );
        set("order_owner", me->query("id"));
        set("order_type", arg);
        return 1;
}

int do_close(string arg)
{
        object me=this_player();
        object room;
        if(arg!="door") return notify_fail("你要干什么？\n");
        room=this_object();
        room->delete("exits/down");
        (int)me->query_temp("plugin");
        me->set_temp("plugin",1);
        message("channel:chat", HIR+"【江湖通告】"+me->name()+"连门都关上啦 !!!!\n"NOR, users() );
        return 1;
}

int do_open(string arg)
{
        object me=this_player();
        object room;
        if(arg!="door") return notify_fail("你要干什么？\n");
        room=this_object();
        room->set("exits/down",__DIR__"jiulou");
        (int)me->query_temp("plugin");
        me->delete_temp("plugin",1);
        message("channel:chat", HIR+"【江湖通告】"+me->name()+"终于打开门啦 !!!!\n"NOR, users() );
        return 1;
}

int valid_leave(object me, string dir)
{
        if (me->query("id") != query("order_owner"))
                return 1;
        return notify_fail(RED + "先用 order end 结束后再走.\n" + NOR);
}


