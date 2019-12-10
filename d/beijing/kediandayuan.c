inherit ROOM;

void create()
{
    set("short", "客店后院");
    set("long", @LONG
这里客店后院。一阵阵打斗之声从东面的厢房 (room) 中传来，其中夹杂
着一个女子的声音。房门的板壁(wall)不住的震动，似乎客房四周的板壁都要
被刀风掌力震坍一般。南面是客店大门。
LONG );
    set("no_sleep_room", 1);
    set("exits", ([
        "east" : __DIR__"kefang",
        "south" : __DIR__"fukedian",
    ]));
    set("item_desc", ([
        "wall" : "\n这是一堵木墙，板壁不过一寸来厚，被震得摇摇晃晃。\n",
        "room" : "\n这里是客店的东客房，布置很简单，房间里发生了打斗，地上斑斑点点都是血迹。\n",
    ]));
    setup();
}

int valid_leave(object me, string dir)
{
    object room;

    if (dir != "east" )
        return ::valid_leave(me, dir);

    room = find_object(query("exits/east"));
    if (! room) room = load_object(query("exits/east"));
    if (room && present("la ma", room) && present("dubi shenni", room))
    {
        if ((int)me->query_skill("force") < 100)
            return notify_fail("\n你一步踏进客房，突觉一股力道奇"
                               "大的劲风激扑出来，将你一撞，\n"
                               "你登时立足不稳，腾腾腾到退三步，"
                               "摔了一跤。\n");
        me -> receive_damage ("qi",50) ;
        me -> receive_wound  ("qi",50) ;
    }
    return ::valid_leave(me, dir);
}

void init()
{
    add_action("do_thrust","thrust");
    add_action("do_thrust","ci");
    add_action("do_thrust","stab");
}

int do_thrust(string arg)
{
    object room/*, me*/,man;
    object weapon;

    if (! arg || arg != "wall" ) return notify_fail("你要刺什么？\n");

    weapon = this_player()->query_temp("weapon");
    if (! weapon ||
        (weapon->query("skill_type") != "sword" &&
         weapon->query("skill_type") != "blade" &&
         weapon->query("skill_type") != "dagger"))
        return notify_fail("不用刀剑恐怕不行吧！\n");

    if (!( room = find_object(__DIR__"kefang")))
        room = load_object(__DIR__"kefang");

    if (man = present("la ma", room))
    {
        message_vision("\n$N走到墙边，抽出兵刃，对准木板狠"
                       "狠地一戳。\n",this_player());

        if (this_player()->query_temp("apply/damage") < 100)
        {
            message_vision("结果$N笃的一声，兵刃插入寸许，再也"
                           "刺不进半分。\n",this_player());
            return 1;
        }

        message_vision("只听噗的一声，匕首轻轻穿过木板，房中立时传"
                       "来一声惨叫。\n",this_player());
        message("vision", "忽然一个喇嘛惨叫一声倒了下去。\n",room );
        man->die();
    }
    else return notify_fail("屋里没有喇嘛，不用再杀了。\n");

    return 1;
}
