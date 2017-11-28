// xieyan.c

#include <ansi.h>

inherit NPC;

mixed ask_me(); 
void greeting(object ob);

void create()
{
        seteuid(getuid());
        set_name("谢烟客", ({ "xie yanke", "xie" }));
        set("long", @LONG
摩天居士谢烟客乃天下第一奇人，武功高强，曾经散出
玄铁令三枚，誓言可以满足拥有此令的三人任何愿望。
LONG );
        set("nickname", HIG "摩天居士" NOR);
        set("gender", "男性");
        set("age", 71);
        set("shen_type", 1);
        set("attitude", "friendly");

        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("qi", 5000);
        set("max_qi", 5000);
        set("jing", 2500);
        set("max_jing", 2500);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 150);

        set("combat_exp", 2500000);

        set_skill("force", 260);
        set_skill("unarmed", 250);
        set_skill("dodge", 250);
        set_skill("parry", 250);
        set_skill("strike", 260);
        set_skill("yijinjing", 260);
        set_skill("shexing-lifan", 250);
        set_skill("bizhen-qingzhang", 260);

        map_skill("force", "yijinjing");
        map_skill("dodge", "shexing-lifan");
        map_skill("strike", "bizhen-qingzhang");
        map_skill("parry", "bizhen-qingzhang");

        prepare_skill("strike", "bizhen-qingzhang");

        set("inquiry", ([
                "碧针清掌" : (: ask_me :),
                "绝招"     : (: ask_me :),
                "澎湃"     : (: ask_me :),
                "绝技"     : (: ask_me :),
                "玄铁令"   : "两枚玄铁令我已经收回。",
                "石破天"   : "狗杂种那个白痴还没死么？",
        ]));

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

int accept_object(object me, object ob)
{
        if (ob->query("id") != "xuantie ling")
        {
                command("say 你给我这种东西干什么？");
                return 0;
        } else
        {
                command("say 很好，很好！");
                command("say 我这里有一套碧针清掌，是我晚年创下的绝学，可以传授予你。");
                me->set("can_learn/xieyanke/bizhen-qingzhang", 1);
                destruct(ob);
                return -1;
        }
}

int recognize_apprentice(object ob, string skill)
{
        if (! ob->query("can_learn/xieyanke/bizhen-qingzhang"))
        {
                command("say 你是什么东西？给我滚开！\n");
                return -1; 

        }

        if (skill != "bizhen-qingzhang")
        {
                command("killair");
                command("say 我说过只传授你这套掌法，你不学就算了。");
                return -1;
        }

        if (ob->query_skill("bizhen-qingzhang", 1) > 100)
        {
                command("say 够了，剩下的自己去练。");
                return -1;
        }
        return 1;
}

mixed ask_me()
{
        object me;

        me = this_player();
        if (me->query("can_perform/bizhen-qingzhang/pengpai"))
                return "能教的已经教完了，还来找我干嘛？";

        if (! me->query("can_learn/xieyanke/bizhen-qingzhang"))
                return "给我滚开，少在我面前罗嗦！";

        if (me->query_skill("bizhen-qingzhang", 1) < 180)
                return "你的碧针清掌练这个程度就来问绝招？";

        message_vision(HIW "$n" HIW "冷笑一声，双掌陡然挥舞"
                       "出一个大圈，横推而出，顿时一股汹涌澎"
                       "湃的劲气如波浪一般向" HIW "涌来。\n$N"
                       HIW "大骇，硬接了这一招，只感内息翻腾"
                       "，全身骨骼快要散架一般。突然目光一亮"
                       "，似乎明白了什么。\n" NOR,
                       me, this_object());

        command("grin");
        command("say 我能教的已经教完了，以后大家各走各的路。");

        tell_object(me, HIC "你学会了碧针清掌「澎湃」这一招。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 300000);
        me->set("can_perform/bizhen-qingzhang/pengpai", 1);
        return 1;
}
