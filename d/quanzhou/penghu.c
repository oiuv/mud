// Room: /d/quanzhou/penghu.c
// Date: May 7, 96   Jay

#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "澎湖岛");
	set("long", @LONG
澎湖为台湾属岛，海峡中砥，台岛屏障。马公港内多
为本地渔民，早晚劳作，与世无争。
    港内有舟(zhou)船(chuan) 往返大陆台岛，冲波激浪
中，自有渔家滋味。
LONG );
	set("item_desc", ([
                "chuan" : "一条大海船。出远海没这样的船可不行。\n",
                "zhou"  : "一条水军战舟，前往台湾，还得靠它。\n",
	]));
	set("objects", ([
		__DIR__"npc/liu": 1,
		"/d/city/npc/bing" : 4,
	]));
	set("outdoors", "quanzhou");
	setup();
}

void init()
{
        add_action("do_enter", "enter");
}

int do_enter( string arg)
{
        object ob;
        string dir;

        ob = this_player();
        if (arg !="chuan" && arg !="zhou")
        {
                tell_object(this_player() , "你要去哪儿？\n" ) ;
                return 1;
        }

        if (arg == "chuan")
        {
                message_vision("船夫一见有人上船，忙叫了一声：开船喽！\n", ob);
                message_vision("船夫升起帆，船就向西方顺风航行。\n", ob);
                call_out("tdalu", 10, ob);
        } else
        {
                message_vision("水兵一见有人上船，忙叫了一声：开船喽！\n", ob);
                message_vision("水兵升起帆，船就向东方逆风航行。\n", ob);
                call_out("ttaiwan", 10, ob);
        }

        ob->move(__DIR__"dahai");
        tell_object(ob, BLU "你在海上航行了很久很久.......\n" NOR);
        return 1;
}

void tdalu(object ob)
{
        if (! objectp(ob) || find_object(__DIR__"dahai") != environment(ob))
                return;

        tell_object(ob , "大船终于抵达了中原的一个繁华城市。你走下船来。\n");
        ob->move(__DIR__"haigang");
}

void ttaiwan(object ob)
{
        if (! objectp(ob) || find_object(__DIR__"dahai") != environment(ob))
                return;

        tell_object(ob , "战舟终于抵达了台湾的一个破败城市。你走下船来。\n");
        ob->move(__DIR__"chiqian") ;
}
