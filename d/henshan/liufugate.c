#include <ansi.h>
inherit ROOM;

int do_knock(string arg);

void create()
{
        set("short", "刘府大门");
        set("long",
"这里是刘府大门。刘府的主人，就是衡山派中的仅次于掌\n门人莫大先生"
"的第二号人物刘正风刘老爷子。今天兴许刘府有\n事吧，大门(gate)紧闭，管"
"家家丁也异样紧张，莫非今天出了\n什么事情。\n\n" HIR
"     ||                                        ||\n"
"  ┏≡≡┓" HIW "   ※※※※※※※※※※※※※※" HIR "   ┏≡≡┓\n"
"  {------}" HIW "   ※                        ※" HIR "   {------}\n"
"  ┗≡≡┛" HIW "   ※       " HIY "刘      府" HIW "       ※" HIR "   ┗≡≡┛\n"
"   │││" HIW "    ※                        ※" HIR "    │││\n"
"   │││" HIW "    ※※※※※※※※※※※※※※" HIR "    │││\n"
"   │││                                    │││\n\n"

); 
        set("exits", ([
                "south"  : __DIR__"hengyang1",
        ]));

        set("item_desc", ([
                "gate" : HIR "\n朱红的大门紧闭着，敲敲(knock)看吧。\n\n" NOR,
        ]));

        set("objects", ([
                __DIR__"npc/haoke"    : 4,
                __DIR__"npc/jian-ke" : 2,
        ]));  

        setup();
}
void init()
{
        add_action("do_knock", "knock");
        add_action("do_push", "push");
        add_action("do_push", "open");
}

int do_knock(string arg)
{
        object me;

        me = this_player();
              message_vision(HIW "\n$N“咚，咚，咚……。”地敲着门，可里面"
                             "却一点动静都没有。\n\n" NOR, me);

        me->set_temp("marks/liufu",1);

        return 1;
}

int do_push(string arg)
{
//  int n;
    object /*weapon,*/me = this_player();
//  mapping fam;

    if ( !me->query_temp("marks")) 
              return notify_fail("门关得牢牢的，急切打不开！\n");

    if ( !arg || arg != "gate" ) 
              return notify_fail("这是干嘛？\n");

    message_vision(HIY "$N走到门前，把门随便一推，居然就推开了大门！\n\n"NOR,me);

    set("exits/enter",__DIR__"liufudayuan");

    remove_call_out("close");
    call_out("close", 5, this_object());

    return 1;
}
void close_out()
{
    if (query("exits/enter")) 
              delete("exits/enter");
}

void close(object room)
{
    message("vision",HIC"\n一阵咿咿呀呀门响，里面有人把大门给关上了。\n"NOR, room);

    room->delete("exits/enter");
}