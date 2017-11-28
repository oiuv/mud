//Room: qunyuys8.c

inherit ROOM;

void close_path();

void create()
{
        set("short", "群玉楼雅室");
        set("long", @LONG
一间雅室。房中放着一张大床，床上铺着绣花的锦被和枕头。湘绣
驰名天下，大红锦被上绣的是一对戏水鸳鸯，颜色灿烂，栩栩欲活。几
上点着一根红烛，红烛旁是一面明镜，一只梳妆箱子。床前地下两对绣
花拖鞋，一对男的，一对女的，并排而置。仔细看看你会发现这个房间
的床有些怪异。
LONG);
        set("exits", ([ /* sizeof() == 1 */
        	"west" : __DIR__"qunyulou3",
        ]));
        set("objects", ([
        	__DIR__"npc/dashou" : 4,
        ]) );
        set("item_desc", ([
        	"bed": "这张床似乎可以推开(push)。\n",
        	"床" : "这张床似乎可以推开(push)。\n",
        	"大床" : "这张床似乎可以推开(push)。\n"
        ]) );

	setup();
}
void init()
{
        add_action("do_push", "push");
}

void close_path()
{
        if (! query("exits/enter")) return;
        message("vision","大床又滑了回来，盖住了暗格。\n",
                this_object());
        delete("exits/enter");
}

int do_push(string arg)
{
	object me;
	me = this_player();
        if (! arg || arg == "" ) return 0;
        if (arg == "bed" || arg == "床" || arg == "大床")
	{
                write("你用力推开一张大床，");
	        if ((int) me->query_str() >= 30)
	        {
	                write("床下露出了一个暗格。\n");
	                if (! query("exits/enter"))
	                {
     	                        set("exits/enter", __DIR__"qunyums");
                                call_out("close_path", 5);
			}
                        return 1;	
                } else
                write("试着推了推后面的暗格，但没有推开。\n");
                return 1;
        }
        return notify_fail("你要推开什么？\n");
}

int valid_leave(object me, string dir)
{
        object ob;
        if (dir == "enter" &&
            objectp(ob = present("da shou", this_object())) &&
            living(ob))
	{
                message_vision("$N对$n喊道：那里是群玉楼的私人"
                       "地方，外人不要进去！\n", ob, me);
                write("糟糕！被发现了！\n");
                ob->kill_ob(me);
                me->fight_ob(ob);       
                return -1;
	}

        return 1;
}
