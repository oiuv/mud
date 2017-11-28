// Room: /guiyun/taihu.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void check_trigger();
void on_board();
void arrive();
void close_passage();
int do_yell(string arg);
void reset();

void create()
{
        set("short", "太湖");
        set("long", @LONG
太湖古称五湖，襟带三州，周行五百里，东南之水皆归于此。
其时但见长天无波，放眼皆碧，七十二峰苍翠挺立于三万六千顷波
涛之中，不觉令人心怀大畅。由此登船可前往太湖之中的归云庄。
LONG );
        set("outdoors", "guiyun");

        set("exits", ([
                "north"     : __DIR__"shanlu1",
        ]));

        set("objects", ([
                __DIR__"npc/xiaolu" : 1,
                __DIR__"npc/seller" : 1,
        ]));

        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu", }));

        setup();
}

void init()
{
        add_action("do_yell", "yell");
        add_action("do_cross", "cross");
}

/*在此付钱摆渡或买鱼吃*/
/*（等）渡船靠了岸，付了钱，船家一声吆喝，客人们一涌
 * 而入，小小渡船片刻间便越过波澜涛涛的汉江，靠上北岸
 */

void check_trigger()
{
    object room;

    if (! query("exits/enter"))
    {
        if (! (room = find_object(__DIR__"duchuan")))
            room = load_object(__DIR__"duchuan");
        if (room = find_object(__DIR__"duchuan"))
        {
            if ((int)room->query("yell_trigger") == 0)
            {
                room->set("yell_trigger", 1);
                set("exits/enter", __DIR__"duchuan");
                room->set("exits/out", __FILE__);
                message("vision", "一叶扁舟缓缓地驶了过来，艄公将一块踏脚"
                    "板搭上堤岸，以便乘客\n上下。\n", this_object() );
                message("vision", "艄公将一块踏脚板搭上堤岸，形成一个向上"
                    "的阶梯。\n", room);
                remove_call_out("on_board");
                call_out("on_board", 15);
            }
            else
                message("vision", "只听得湖面上隐隐传来：“别急嘛，"
                    "这儿正忙着呐……”\n",this_object() );
        } else
            message("vision", "ERROR: boat not found\n", this_object());
    } else 
        message("vision", "岸边一只渡船上的老艄公说道：正等着你呢，上来吧。\n",
                this_object());
}


void on_board()
{
    object room;

    if (! query("exits/enter")) return;

    message("vision", "艄公把踏脚板收了起来，竹篙一点，扁舟向湖心驶去。\n",
            this_object());

    if (room = find_object(__DIR__"duchuan"))
    {
        room->delete("exits/out");
        message("vision", "艄公把踏脚板收起来，说了一声“坐稳喽”，"
                "竹篙一点，扁舟向\n湖心驶去。\n", room );
    }
    delete("exits/enter");

    remove_call_out("arrive");
    call_out("arrive", 20);
}

void arrive()
{
    object room;
    if (room = find_object(__DIR__"duchuan"))
    {
        room->set("exits/out", __DIR__"matou");
        message("vision", "艄公说“到啦，上岸吧”，随即把一块踏脚板"
            "搭上堤岸。\n",room );
    }
    remove_call_out("close_passage");
    call_out("close_passage", 20);
}

void close_passage()
{
    object room;
    if (room = find_object(__DIR__"duchuan"))
    {
        room->delete("exits/out");
        message("vision", "艄公把踏脚板收起来，把扁舟驶向湖心。\n", room);
        room->delete("yell_trigger"); 
    }
}

int do_yell(string arg)
{
//  string dir;

    if (! arg || arg == "") return 0;

    if (arg == "boat") arg = "船家";
    if ((int)this_player()->query("age") < 16)
        message_vision("$N使出吃奶的力气喊了一声：“" + arg + "”\n",
                       this_player());
    else if((int)this_player()->query("neili") > 500)
        message_vision("$N吸了口气，一声“" + arg + "”，声音中正平和地远远传"
                       "了出去。\n", this_player());
    else
        message_vision("$N鼓足中气，长啸一声：“" + arg + "！”\n",
                       this_player());
    if (arg == "船家")
    {
        check_trigger();
        return 1;
    } else
        message_vision("湖面上远远传来一阵回声：“" + arg +
                       "～～～”\n", this_player());
    return 1;
}

int do_cross()
{
        object me;

        me = this_player();
        if (me->query_skill("dodge") < 100)
        {
                tell_object(me, random(2) ? "你觉得湖面太宽，没有十足的把握跃过去。\n"
                                          : "你看着浩瀚的太湖，心里不禁打了个突，没敢乱来。\n");
                return 1;
        }

        if (me->query("neili") < 100)
        {
                tell_object(me, "你的内力不够，还是休息一下再说吧。\n");
                return 1;
        }

        me->add("neili", -50);
        message_vision("$N身形一晃，已然跃进太湖，只见$P脚踏清波，渐渐远去。\n", me);
        tell_object(me, "你顺利的到达了彼岸！\n");
        me->move(__DIR__"matou");
        return 1;
}

void reset()
{
    object room;

    ::reset();
    if (room = find_object(__DIR__"duchuan"))
        room->delete("yell_trigger"); 
}