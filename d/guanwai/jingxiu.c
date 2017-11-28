// jingxiu.c 静修室

inherit ROOM;

void init();
int close_men();
int force_open(object room);
int do_push(string arg);
int do_knock(string arg);
int valid_leave(object me, string dir);
string look_men();

void create()
{
        set("short", "静修室");
        set("long", @LONG
这里是静修室，屋中有一些胡家弟子在这里打坐练功。南面有一
扇小门(men)，里面隐隐传来了鼾声。
LONG );
        set("exits", ([
                "east" : __DIR__"houyuan",
        ]));

        set("item_desc",([
                "men"  : (: look_men :),
        ]));

        set("objects", ([
                "/clone/weapon/mudao" : 3,
        ]));

        setup();
}

void init()
{
        add_action("do_knock", "knock");
        add_action("do_push", "push");
        add_action("do_kick", "kick");
}

int close_men()
{
        object room;

        if (!( room = find_object(__DIR__"xiuxishi")) )
                room = load_object(__DIR__"xiuxishi");

        if (objectp(room))
        {
                delete("exits/south");
                message("vision", "门吱吱呀呀地自己合上了。\n", this_object());
                room->delete("exits/north");
                message("vision", "门吱吱呀呀地自己合上了。\n", room);
        } else message("vision", "ERROR: men not found(close).\n", room);

        return 1;
}

int do_knock(string arg)
{
        object room;

        if (!arg || (arg != "door" && arg != "men"))
                return notify_fail("你要敲什么？\n");

        if (query("exits/south"))
                return notify_fail("大门已经是开着了。\n");

        if (!( room = find_object(__DIR__"xiuxishi")) )
                room = load_object(__DIR__"xiuxishi");

        if(objectp(room))
        {
                if ((int)room->query_temp("sleeping_person") > 0)
                {
                        message_vision("$N刚轻轻地敲了一下门，就听见里面传出一阵雷鸣般的鼾声，\n"
                                       "显然里面的人睡得跟死猪似的，怎么敲都没用了\n",
                                       this_player());
                } else
                if ((int)room->query_temp("person_inside") > 0)
                {
                        switch (random(2))
                        {
                        case 0:
                                message_vision("$N轻轻地敲了敲门，只听见里面有人很不耐烦地吼到：\n"
                                               "刚躺下就来敲门！我睡着了，听不见！！！\n",
                                               this_player());
                                break;
                        case 1:
                                message_vision("$N轻轻地敲了敲门，只听见里面有些响动，\n"
                                               "好象有人在踱来踱去，拿不定主意是否开门。\n",
                                               this_player());
                                break;
                        }
                } else
                {
                        room->delete_temp("sleeping_person");
                        message_vision("$N轻轻地敲了敲门：咚、咚、咚．．．咚、咚、咚．．．\n",
                                       this_player());
                }
        }

        if (objectp(room))
                message("vision",  "外面传来一阵敲门声，你从门缝往外一瞧，是" +
                        this_player()->name() + "一脸焦急地站在门外，\n"
                        "看样子也想进来休息。\n", room);
        return 1;
}

int do_kick(string arg)
{
        object me;
        object room;

        if (!arg || (arg != "door" && arg != "men"))
                return notify_fail("你要踢什么？\n");

        if (query("exits/south"))
                return notify_fail("大门开着，你踢它干吗？。\n");

        if (!( room = find_object(__DIR__"xiuxishi")) )
                room = load_object(__DIR__"xiuxishi");

        me = this_player();
        if(objectp(room))
        {
                if (me->query("qi") < 40)
                {
                        message_vision("$N飞起一脚，狠狠的踢中大门，然而大门纹丝不动。\n", me);
                        message("vision", "就听“砰”的一声巨响，外面似乎有人发火踢门了。\n", room);
                        tell_object(me, "你觉得脚趾几乎都要断了！\n");
                        me->unconcious();
                } else
                if (me->query("qi") < 100)
                {
                        message_vision("$N飞起一脚，狠狠的踢中大门，然而大门只是晃了一下。\n", me);
                        message("vision", "就听“砰”的一声巨响，外面似乎有人发火踢门了。\n", room);
                        tell_object(me, "你觉得脚非常的痛！\n");
                        me->set("qi", 20);
                        me->receive_wound("qi", 20);
                } else
                {
                        message_vision("$N飞起一脚，狠狠将大门踹开。\n", me);
                        message("vision", "就听“砰”的一声巨响，门忽的一下子就开了，吓了"
                                "你一跳。仔细一看，原来是" + me->name() +
                                "气势汹汹的站在门口。\n", room);
                        me->receive_damage("qi", 100);
                        room->delete_temp("person_inside");
                        set("exits/south", __DIR__"xiuxishi");
                        room->set("exits/north", __FILE__);
                        remove_call_out("close_men");
                        call_out("close_men", 10);
                }
        }

        return 1;
}

int do_push(string arg)
{
        object room;

        if (query("exits/south"))
                return notify_fail("门已经是开着了。\n");

        if (!arg || (arg != "door" && arg != "men"))
                return notify_fail("你要推什么？\n");

        if (!(room = find_object(__DIR__"xiuxishi")))
                room = load_object(__DIR__"xiuxishi");

        if (objectp(room))
        {
    	        if ((int)room->query_temp("person_inside") <= 0)
    	        {
                        room->delete_temp("person_inside");
                        set("exits/south", __DIR__"xiuxishi");
                        message_vision("$N轻轻地把门推开。\n", this_player());
                        room->set("exits/north", __FILE__);
                        message("vision", "有人从外面把门推开了。\n", room);
                        remove_call_out("close_men");
                        call_out("close_men", 10);
                } else
                {
                        message_vision("$N想把门推开，却发觉门被人从里面闩上了。\n",
                                       this_player());
                }
        }

        return 1;
}

string look_men()
{
        object room;

        if (!( room = find_object(__DIR__"xiuxishi")))
                room = load_object(__DIR__"xiuxishi");

        if (objectp(room) && (int)room->query_temp("person_inside") > 0)
                return "门上挂了个牌子：休息中、请毋打扰\n";

        return "门上挂了个牌子：休息室\n";
}

int valid_leave(object me, string dir)
{

        object room;

        if (!( room = find_object(__DIR__"xiuxishi")) )
                room = load_object(__DIR__"xiuxishi");

        if (objectp(room) && dir == "south")
        {
                room->add_temp("person_inside", 1);
                // will open the door if ppl inside stay too long
                remove_call_out("force_open");
                call_out("force_open", 599, room);
        }

        return ::valid_leave(me, dir);
}

int force_open(object room)
{
        if (! objectp(room)) return 0;
    	if ((int)room->query_temp("person_inside")<=0) return 0;

        room->delete_temp("person_inside");
    	set("exits/north", __DIR__"xiuxishi");
    	room->set("exits/south", __FILE__);
    	message("vision", "外面突然响起粗重的脚步声，由远而近，到门前停了下来．．．\n"
        		  "几个弟子一下子把门打开，伸个头进来，骂骂咧咧道：什么鸟人\n"
			  "在里面磨磨蹭蹭的？\n", room);
    	remove_call_out("close_men");
    	call_out("close_men", 10);

    	return 1;
}
