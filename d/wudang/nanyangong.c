#include <ansi.h>
inherit ROOM;

void close_andao();
string look_xiang();
int do_move(string arg);

void create()
{
        set("short","南岩宫");
        set("long",@LONG
这里是就是武当山南岩宫。此宫半卧悬崖之下。殿内三清
坐像 (xiang)金光闪闪，气宇轩昂。殿内天井处芳草迷径，百
卉争妍。有几个装束醒目的武当三代弟子从这匆匆走过。南面
高台摆有真武剑阵，剑气逼人而来。
LONG);
        set("exits", ([
          	"out"    : __DIR__"shizhu",
          	"southup": __DIR__"gaotai",
      	]));
      	set("item_desc",([
          	"三清坐像" : (: look_xiang :),
          	"xiang"    : (: look_xiang :),
      	]));
      	set("no_clean_up", 0);
      	setup();
}

int valid_leave(object ob, string dir)
{
        mapping myfam;

        ob = this_player();
        myfam = (mapping)ob->query("family");

        if ((int)ob->query("combat_exp", 1) < 10000 &&
           (dir == "southup"))
            	return notify_fail(HIY "外面的真武剑阵威力太大，你被"
                                   "内力鼓荡，不能上去。\n");

        if ((! myfam || (myfam["family_name"] != "武当派")) &&
           (dir == "southup"))
            	return notify_fail(HIY "外面的真武剑阵威力太大，你被"
                                   "内力鼓荡，退了回来。\n");
        return 1;
}

void init()
{
        add_action("do_move", "move");
}

string look_xiang()
{
        return YEL "三清坐像纯铜打就，镀以纯金，光照满殿。只是好象三"
               "个坐像摆得并不很整齐。\n" NOR;
}

int do_move(string arg)
{
        object room, ob;

        ob = this_player();

        if (! arg || arg != "xiang" )
		return notify_fail("你要移动什么？\n");

        message_sort(HIY "\n$N" HIY "走到三清坐像背后，用力使劲推移老"
                     "君像，慢慢的推着，坐像终于推了。像下露出一个大"
                     "洞，几排石阶往下伸去，从这里分明通向一个暗道。"
                     "\n\n" NOR, ob);
        set("exits/down", __DIR__"nanyan0");

        if (room = find_object(__DIR__"nanyan0"))
        {
        	room->set("exits/up", __FILE__);
           	message("vision", HIY "\n天花板忽然发出轧轧的声音，"
                        "露出一个向上的楼梯。\n" NOR, room );
        }
        remove_call_out("close_andao");
        call_out("close_andao", 3);
        return 1;
}

void close_andao()
{
    	object room;
//      int i;

        if (! query("exits/down")) return;
    		message("vision", HIY "\n只听乒地一声响，老君像自动"
                        "移回原处。\n" NOR, this_object());

    	if (room = find_object(__DIR__"nanyan0"))
    	{
        	message("vision", HIY "\n只听乒地一声响，向上的洞口"
                        "自动严严实实地关了起来。\n" NOR, room);
    	}
    	delete("exits/down");
}