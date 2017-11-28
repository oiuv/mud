// azhu.c

#include <ansi.h>

inherit NPC;

int inquiry_tanqin();
mixed ask_me();

void create()
{
        set_name("阿朱", ({ "azhu", "zhu" }));
        set("long",
                "这是个身穿红衣的女郎，大约十七八岁，一脸精灵顽皮的神气。\n"
                "一张鹅蛋脸，眼珠灵动，别有一番动人风韵。\n");

        set("gender", "女性");
        set("age", 17);
        set("shen_type", 1);

        set("neili", 200);
        set("max_neili", 200);
        set("max_qi", 160);
        set("max_jing", 160);

        set_skill("force", 40);
        set_skill("unarmed", 40);
        set_skill("dodge", 30);
        set_skill("parry", 30);
        set_skill("sword", 30);
        set_skill("pretending", 200);

        set_temp("apply/attack", 10);
        set_temp("apply/defense", 10);
        set_temp("apply/damage", 5);

        set("combat_exp", 10000);
        set("inquiry",([
                "曼陀山庄" : "我才不敢去曼陀山庄，王夫人太霸道了!\n",
                "王语嫣" : "哎，只有她才配得上我们公子，也不知她现在怎么样了!\n",
                "阿碧"   : "那小丫头也不只跑哪儿去了。\n",
                "弹琴"   : (: inquiry_tanqin :),
                "易容"   : (: ask_me :),
                "易容术" : (: ask_me :),
        ]) );
        setup();
        carry_object(__DIR__"obj/goldring")->wear();
        carry_object(__DIR__"obj/necklace")->wear();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object(__DIR__"obj/pink_cloth")->wear();
        carry_object(__DIR__"obj/flower_shoe")->wear();
        carry_object("/clone/misc/mask");
}

int inquiry_tanqin()
{
        object me = this_player();
        message_vision("阿朱说道：这位" + RANK_D->query_respect(me) +
                       "这么有雅兴，那我就为你弹奏一曲！\n只听琴"
                       "声繁复清亮，你不由的痴了。\n", me );
        message_vision("阿朱一曲终了，道个万福，说道：现丑了。\n", me );
        return 1;
}

mixed ask_me()
{
        object me;

        me = this_player();
        if (me->query("family/family_name") != "慕容世家")
        {
                message_vision(CYN "$n" CYN "望着$N" CYN +
                               "吃吃的笑，道：“侬说啥子耶？”\n" NOR, me,
                               this_object());
                return 1;
        }

        if (me->query("age") > 25)
        {
                message_vision(CYN "$n" CYN "看了看$N" CYN
                               "，惊呼道：“现在还这么贪玩？你"
                               "的年纪不要太大了。”\n", me, this_object());
                return 1;
        }

        if (me->query("age") < 18)
        {
                message_vision(CYN "$n" CYN "笑嘻嘻的对$N" CYN
                               "道：“小孩子家胡闹什么？找你的小"
                               "碧姐姐要糖吃去吧。”\n",
                               me, this_object());
                return 1;
        }

        if (me->query("gender") != "女性")
                return "这公子你也想学习易容术...嘻嘻...还是好好练武吧。";

        me->set_temp("can_learn/azhu/pretending", 1);
        return "好吧，你要是想学易容术(pretending)，我可以教给你一点哦。";
}

int recognize_apprentice(object me, string skill)
{
        if (! me->query_temp("can_learn/azhu/pretending"))
                return 0;

        if (skill != "pretending")
                return 0;

        return 1;
}