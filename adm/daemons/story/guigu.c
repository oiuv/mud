// story:pangtong.c

#include <ansi.h>

STATIC_VAR_TAG string char_id;
STATIC_VAR_TAG string char_name;

object select_character();
int give_gift();

STATIC_VAR_TAG mixed *story = ({
        "三军蜿蜒而行。",
        "“嗯？那写了什么？”",
        "小兵：报告军师，上面写着“落鸡坡”三个字。",
        "庞统：嗯... 不好！我的外号是小鸡，这里大大的不吉利，火速撤退！",
        "“轰！隆隆！”",
        "张任：嘿嘿！庞统，哪儿跑？以为我们四川这儿想来就来，想走就走？",
        "庞统：魏延将军呢？",
        "小兵：报告军师，魏延将军在前头，已经出谷了。",
        "庞统：黄忠将军呢？",
        "小兵：报告军师，黄老将军在后头，还没有入谷。",
        "庞统：他奶奶的，就我一个不紧不慢，恰好赶在中间！",
        "张任：放箭！",
        "箭如雨下",
        "庞统翻翻白眼，倒在地上，口中吐出两口鲜血，死了。",
        "......",
        "一年过去了...",
        "十年过去了...",
        "一百年过去了...",
        "一千年过去了...",
        "$N漫步在山间... 咦？这是什么？",
        "乱堆从中一堆枯骨，中间好像有本书？",
        "$N翻了出来，发现这本书似乎不是一般的材料书写的。",
        "“好像很值钱呀”，让我看看....",
        "“嗯？鬼谷神算？”",
        (: give_gift :),
});

void create()
{
        seteuid(getuid());
        if (! objectp(select_character()))
        {
        	STORY_D->remove_story("guigu");
                destruct(this_object());
                return;
        }
}

string prompt() { return HIW "【悠悠传奇】" NOR; }

object select_character()
{
        object *obs;
        object ob;

        obs = filter_array(all_interactive(), (: ! wizardp($1) &&
                                                 living($1) &&
                                                 $1->query_skill("literate", 1) > 50 &&
                                                 ! $1->query("doing") :));
        if (! sizeof(obs))
                return 0;

        ob = obs[random(sizeof(obs))];
        char_id = ob->query("id");
        char_name = ob->name(1);
        return ob;
}

mixed query_story_message(int step)
{
        mixed msg;

        if (step >= sizeof(story))
                return 0;

        msg = story[step];
        if (stringp(msg))
        {
                msg = replace_string(msg, "$N", char_name);
                msg = replace_string(msg, "$ID", char_id);
        }
        return msg;
}

int give_gift()
{
        object ob;
        object gob;

        ob = find_player(char_id);
        if (! ob) return 1;

        STORY_D->remove_story("guigu");

        gob = new("/clone/book/guigu");
        gob->move(ob, 1);
        CHANNEL_D->do_channel(this_object(), "rumor", "听说" + ob->name(1) +
                              "捡到了奇书《鬼谷神算》。");
        return 1;
}
