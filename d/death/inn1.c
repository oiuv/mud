#include <ansi.h>
inherit ROOM;
 
int do_stuff(object ob);
 
void create()
{
        set("short", HIB "【小店】" NOR);
        set("long", HIB @LONG

                      小                店  

    你一进来就发现屋里异常的温暖，墙角壁炉里微弱的火光将你的影
子投射在对面的墙上。几个人影围在炉旁不知在讨论些什麽。屋内有几
张木桌、椅，墙上挂了几幅字画，一切看来非常的详和宁静，你几乎忘
了自己身在何处。


LONG NOR );
        set("exits", ([
                 "east" : "/d/death/road1",
        ]));
 
	set("objects", ([
		__DIR__"npc/ghost": 1,
	]) );

        set("item_desc", ([
                "shadows" : @SHADOWS
从你站的位置很难辨别出那几个人的容貌, 四个披著黑斗蓬的人斜靠在壁
炉边的角落, 偶尔传来其中几人说话的声音, 不过从这个距离你无法听到
他们讨论的内容. 当你还在考虑要不要靠过去一点时, 其中一人回头看了
你一眼, 你愣住了... 那人... 那人......... 居然长得跟你一模一样!
SHADOWS
        ]) );
        
        set("no_fight", 1);
	set("no_sleep_room", 1);

        setup();
}

void init()
{
        add_action("redirect_ask", "ask");
}
 
int redirect_ask(string str)
{
        object ob;
        string name, tmp1, tmp2;
        
        ob = this_player();
        name = (string)ob->query("id");
        
        // if (! str || ! ob->is_ghost()) return 0;
        if (!str ) return 0;
        if (sscanf(str,"%s about %s",tmp1, tmp2) == 2) {
                if (tmp1 == name && tmp2 =="回家") 
                        return do_stuff(ob);
                        else return 0;
        }
        else return 0;
        return 0;
}
 
int do_stuff(object ob)
{
        write("你走上前去, 低声的向那个长得跟你一样的人询问回家的事.\n");
        tell_room(environment(ob),(string)ob->query("name")+
                "往壁炉那走去, 和一群黑影般的人不知说了些什麽.\n",
                ({this_object(), ob}));
        tell_room(environment(ob),
                "一眨眼的功夫"+(string)ob->query("name")+"竟然不见了.\n",
                ({this_object(), ob}));
        write("那人一句话也不说就往你这边撞过来, 你眼前一阵黑....\n");
        ob->reincarnate();
        ob->move("/d/city/wumiao");
        message("vision",
                "你忽然发现前面多了一个人影，不过那人影又好像已经在那里\n"+
                "很久了，只是你一直没发觉。\n", environment(ob), ob);
        return 1;
}

