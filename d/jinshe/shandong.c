// shandong.c
#include <ansi.h>
inherit ROOM;

#define SWORD "/clone/lonely/jinshejian"

void create()
{
        set("short", "山洞");
        set("long", @LONG
对面石壁上斜倚着一副骷髅骨，身上衣服已烂了七八成，那骷髅
骨宛然尚可见到是个人形。见石室中别无其他可怖事物。骷髅前面横
七竖八的放着十几把金蛇锥，石壁上有几百幅用利器刻成的简陋人形
(map) 。图形尽处，石壁上出现了十六个字(word)，也是以利器所刻。
十六字之旁，有个剑柄凸出在石壁之上，似是一把剑插入了石壁，直
至剑柄。
LONG );
        set("sword_count", 1);
        set("exits", ([ /* sizeof() == 2 */
            "south" : __DIR__"yongdao2",
        ]));
        set("objects", ([
            __DIR__"obj/jinshe-zhui" : 1,
            __DIR__"obj/skeleton" : 1,
        ]));
        set("item_desc", ([
            "map"  : "石壁每个人形均不相同，举手踢足，似在练武。\n",
            "word" : "“重宝秘术，付与有缘，入我门来，遇祸莫怨。”\n",
        ]) );
        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_think", "think");
        add_action("do_pull", "pull");
        add_action("do_pull", "ba");
}

int do_pull(string arg)
{
        object ob, me= this_player();

	if (arg != "sword")
                return notify_fail("你要拔什么？\n");

	if (query("sword_count") < 1)
		return notify_fail("剑好象已经被人拔走了。\n");

        if (me->query("neili") < 2000 ||
            me->query_str() < 40)
        {
                message_vision("$N好奇心起，握住剑柄向外一拔，却是"
                               "纹丝不动，竟似铸在石里一般。\n", me);
                me->set("neili", 0);
                return 1;
        }
        if (! ob = find_object(SWORD))
                ob = load_object(SWORD);
        ob->move(me);
                message_vision("$N紧紧握住剑柄，潜运内力，嗤"
                               "的一声响，拔了出来，剑柄下果"
                               "然连有剑身。\n", me);
        me->add("neili",-1500);
		add("sword_count", -1);
        return 1;
}

int do_think(string arg)
{
        object ob;
        int c_skill;

        ob = this_player();

	if (arg != "map")
                return notify_fail("你要琢磨什么？\n");

        c_skill = (int)ob->query_skill("jinshe-jian", 1);

        if (! ob->can_improve_skill("jinshe-jian"))
        {
                message_vision("$N的实战经验不足，无法领悟"
                               "石壁内容。\n", ob);
                return 1; 
        }

        if (ob->query("jing") < 20)
        {
                message_vision("$N太累了，现在无法领悟石壁"
                               "内容。\n", ob);
                return 1; 
        }

        if (c_skill > 50)
        {
                message_vision("$N觉得石壁内容太肤浅了。\n", ob);
                return 1; 
        }
        if (! SKILL_D("jinshe-jian")->valid_learn(ob))
               	return 0;
        message_vision("$N面对着石壁静思良久，对金蛇剑法似有所悟。\n", ob);
        ob->improve_skill("jinshe-jian", 1 + random(ob->query("int")));
        ob->receive_damage("jing", 15);
        return 1;
}
