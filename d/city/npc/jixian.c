#include  <ansi.h>

inherit  NPC;

object  room  =  0;

void  create()
{
    set_name("白髯鸡仙",  ({"ji xian",  "xian"  }));
    set("gender",  "男性");
    set("age",  60);
    set("per",  30);
    set("long",  "一位留着白髯的鸡仙。\n");
    set("combat_exp",  5000);
    set_skill("force",  50);
    set_skill("unarmed",  50);
    set_skill("dodge",  50);
    set_skill("parry",  50);
    set("gin",  500);
    set("max_gin",  500);
    set("kee",  500);
    set("max_kee",  500);
    set("sen",  500);
    set("max_sen",  500);
    set("force",  150);
    set("max_force",  150);
    set("mana",  150);
    set("max_mana",  150);
    set("force_factor",  10);
    setup();
}

void  init()
{
    ::init();
    add_action("do_fight",  "fight");
    add_action("do_kill",  "kill");
    if  (room  ==  0)
        room  =  environment  (this_object());
}

void  refuse_message  (object  me,  object  who)
{
    message_vision  ("$N说：人斗人？还是看鸡斗鸡有趣些吧。\n",me,who);
}

int  do_fight(string  arg)
{
    object  who  =  this_player();
    object  me  =  this_object();

    if  (arg  &&  present(arg,environment(who))==me)
    {
        message_vision  ("$N看样子输红了眼，想找$n打架。\n",who,me);
        refuse_message  (me,who);
        return  1;
    }
    return  0;
}

int  do_kill(string  arg)
{
    object  who  =  this_player();
    object  me  =  this_object();

    if  (arg  &&  present(arg,environment(who))==me)
    {
        message_vision  ("$N看样子输红了眼，想杀$n。\n",who,me);
        refuse_message  (me,who);
        return  1;
    }
    return  0;
}
