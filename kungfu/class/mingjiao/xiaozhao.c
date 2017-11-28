// xiaozhao.c
#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
inherit F_GUARDER;

int ask_wuji();
int ask_jian();
int ask_gold();
int ask_ge();
int ask_qiankun();

void create()
{
        set_name("小昭", ({ "xiao zhao", "xiao", "zhao" }));
        set("nickname", HIC "天涯思君不可忘" NOR);
        set("long",
            "她双目湛湛有神，修眉端鼻，颊边微现梨涡，真是秀美无伦，只是年纪幼\n"
            "小，身材尚未长成，虽然容貌绝丽，却掩不住容颜中的稚气。\n");
        set("gender", "女性");
        set("age", 15);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 30);
        set("str", 15);
        set("int", 25);
        set("con", 25);
        set("dex", 30);

        set("max_qi", 500);
        set("max_jing", 200);
        set("max_neili", 500);
        set("jiali", 50);
        set("combat_exp", 50000+random(10000));
        set("score", 20000);

        set_skill("force", 80);
        set_skill("dodge", 80);
        set_skill("unarmed", 80);
        set_skill("sword", 80);
        set_skill("taiji-jian", 70);
        set_skill("taiji-quan", 70);
        set_skill("tiyunzong",50);
        map_skill("dodge", "tiyunzong");
        map_skill("parry", "taiji-jian");
        map_skill("sword", "taiji-jian");
        map_skill("unarmed", "taiji-quan");

        set_temp("apply/attack", 15);
        set_temp("apply/damage", 15);
        set("party/party_name", HIG "明教" NOR);
        set("party/rank", HIG "波斯圣教主" NOR);
        set("party/level", 1);
        set("inquiry", ([
            "张无忌" :  (: ask_wuji :),
            "倚天剑" :  (: ask_jian :),
            "黄金" :    (: ask_gold :),
            "歌" :      (: ask_ge :),
            "乾坤大挪移": (: ask_qiankun :),
            "乾坤大挪移心法": (: ask_qiankun :),
            "wuji" :    (: ask_wuji :),
            "jian" :    (: ask_jian :),
            "gold" :    (: ask_gold :),
            "ge" :      (: ask_ge :),
        ]));

        set("chat_chance", 3);
        set("chat_msg", ({
                    "小昭低声吟道：天涯思君不可忘 武当山顶松柏长\n",
                    "小昭低声吟道：宝刀百炼生玄光 字作丧乱意彷徨\n",
                    "小昭低声吟道：皓臂似玉梅花妆 浮槎北溟海茫茫\n",
                    "小昭低声吟道：谁送冰舸来仙乡 穷发十载泛归航\n",
                    "小昭低声吟道：七侠聚会乐未央 百岁寿宴摧肝肠\n",
                    "小昭低声吟道：有女长舌如利枪 针其膏兮药其肓\n",
                    "小昭低声吟道：不悔仲子逾我墙 当道时见中山狼\n",
                    "小昭低声吟道：奇谋妙计梦一场 剥极而复参九阳\n",
                    "小昭低声吟道：青翼出没一笑扬 倚天长剑飞寒芒\n",
                    "小昭低声吟道：祸起萧墙破金汤 与子共穴相扶将\n",
                    "小昭低声吟道：排难解纷当六强 群雄归心约三章\n",
                    "小昭低声吟道：灵芙醉客绿柳庄 太极初传柔克刚\n",
                    "小昭低声吟道：举火燎天何煌煌 俊貌玉面甘损伤\n",
                    "小昭低声吟道：百尺高塔任回翔 恩断义绝紫衫王\n",
                    "小昭低声吟道：四女同舟何所望 东西永隔如参商\n",
                    "小昭低声吟道：刀剑齐失人云亡 冤蒙不白愁欲狂\n",
                    "小昭低声吟道：箫长琴短衣流黄 新妇素手裂红裳\n",
                    "小昭低声吟道：屠狮有会孰为殃 夭矫三松郁青苍\n",
                    "小昭低声吟道：天下英雄莫能当 君子可欺之以方\n",
                    "小昭低声吟道：秘笈兵书此中藏 不识张郎是张郎\n",
        }) );

	set("coagents", ({
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "zhang wuji" ]),
        }));

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

int ask_wuji()
{
        command("sigh " + this_player()->query("id"));
        say("小昭幽幽地说：天涯思君不可忘，东西永隔如参商。\n");
        return 1;
}

int ask_jian()
{
        command("say 我不知道在哪里...别问我。");
        return 1;
}

int ask_gold()
{
        command("say 不行啊，这不能随便给人。");
        return 1;
}

int ask_ge()
{
        command("nod "+this_player()->query("id"));
        say("小昭曼声唱道：\n\n" +
        "世情推物理  人生贵适意\n\n"+
        "想人间造物搬兴废  吉藏凶 凶藏吉  富贵那能长富贵\n\n"+
        "日盈昃  月满亏蚀  地下东南  天高西北  天地尚无完体\n\n"+
        "展放愁眉  休争闲气  今日容颜  老于昨日  古往今来  尽须如此\n\n"+
        "管他贤的愚的  贫的和富的  到头这一身  难逃那一日\n\n"+
        "受用了一朝  一朝便宜\n\n"+
        "百岁光阴  七十者稀  急急流年  滔滔逝水\n\n");
        return 1;
}

int ask_qiankun()
{
    	command("say 自上代教主阳顶天离奇失踪，乾坤大挪移心法"
		"已经失落很久了。\n");
	command("say 后来张公子才在密道里面找了回来。\n");
        return 1;
}
