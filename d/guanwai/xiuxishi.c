// Room: xiuxishi.c 休息室
// By Marz

inherit ROOM;

void init();
void close_men();
int do_open(string arg);
int do_close(string arg);
int valid_leave(object me, string dir);

void create()
{
        set("short", "休息室");
        set("long", @LONG
这是间整洁的厢房，因门窗常闭着，光线很昏暗。房里别无他物，
只有中间放着一张收拾得舒舒服服的大床，看着就让人想睡觉。
LONG );
        set("no_clean_up", 0);
        set("sleep_room", 1);
        set("no_fight", 1);
        setup();
}

void init()
{
        add_action("do_open", "open");
        add_action("do_close", "close");
}

void close_men()
{
        object room;

        if(!( room = find_object(__DIR__"jingxiu")) )
                room = load_object(__DIR__"jingxiu");
        if(objectp(room))
        {
                delete("exits/north");
                        message("vision", "门吱吱呀呀地自己合上了。\n", this_object());
                room->delete("exits/south");
                message("vision", "门吱吱呀呀地自己合上了。\n", room);
        }
}

int do_close(string arg)
{
        object room;

        if(!( room = find_object(__DIR__"jingxiu")) )
                room = load_object(__DIR__"jingxiu");

        if (!arg || (arg != "men" && arg != "door"))
                return notify_fail("你要关什么？\n");

        if (!query("exits/north"))
                return notify_fail("门已经是关着的了。\n");

        message_vision("$N轻手轻脚的把门关上了。\n", this_player());
        delete("exits/north");

        if(objectp(room))
        {
                room->delete("exits/south");
                message("vision", "门被人从里面关上了了。\n", room);
        }

        return 1;
}

int do_open(string arg)
{
        object room;
        object me = this_player();

        if (!arg || (arg != "men" && arg != "door" && arg != "south"))
                return notify_fail("你要开什么？\n");

        if (query("exits/north"))
                return notify_fail("大门已经是开着了。\n");

        if(!( room = find_object(__DIR__"jingxiu")) )
                room = load_object(__DIR__"jingxiu");

        if(objectp(room))
        {
                set("exits/north", __DIR__"jingxiu");
                message_vision("$N轻手轻脚地把门打开。\n", this_player());
                room->set("exits/south", __FILE__);

                if (me->query_temp("sleeped"))
                {
                message("vision", "吱地一声，"+me->query("name")+"精神焕发地从里
面把门打开了。\n",
                room);
                } else
                {
                message("vision", "梆地一声，"+me->query("name")+"从里面把门打开
，一脸的不耐烦。\n",
                         room);
                }

                remove_call_out("close_men");
                call_out("close_men", 10);
        }

        return 1;
}


int valid_leave(object me, string dir)
{
        object room;

        if ( !::valid_leave(me, dir) )
                return 0;

        add_temp("person_inside", -1);
        if (query_temp("person_inside") <= 0)
                delete_temp("person_inside");

        return 1;
}
