// story:mengzi.c

#include <ansi.h>

STATIC_VAR_TAG string char_id;
STATIC_VAR_TAG string char_name;

object select_character();
int    give_gift();

STATIC_VAR_TAG mixed *story = ({
        "大旱，民饥。",
        "流民如潮。",
        "$N架起大锅，在路边舍粥。",
        "天色渐晚，眼见锅中粥将罄。",
        "只见路边摇摇晃晃走过来一人。",
        "$N勺起最后一碗粥，就道：“嗟...”",
        "猛然间发现那人头戴纶巾，虽然破旧，却是整整齐齐。",
        "$N心中暗道：可不要是一个书呆子，让我这最后一碗粥送不出去。",
        "想到这里，便将那个嗟字暗自吞下肚子，客气道：“这位先生，可能赏脸饮碗粥。”",
        "那人看了看$N，感激道：“一路上我为了这骨气忍饥挨饿，想不到终于遇到这位贤人。”",
        "$N暗道：果然是个书呆子，还好，还好。",
        "...",
        "那人喝完粥，掏出一本破破烂烂的书，递给$N。",
        "$N：...",
        "那人道：“承蒙赐粥，无以相赠，这本孟子送送给先生吧。”",
        "......",
        "眼见那人蹒跚而去，$N翻了翻手中的书，苦笑不止。",
        "“我大字不识一个，要这破书作甚？”想到这里，$N把书随手一丢，收起锅走路。",
        (: give_gift :),
});

void create()
{
        seteuid(getuid());
        if (! objectp(select_character()))
        {
                destruct(this_object());
                return;
        }
}

object select_character()
{
        object *obs;
        object ob;

        obs = filter_array(all_interactive(), (: ! wizardp($1) &&
                                                 living($1) &&
                                                 $1->query_skill("literate", 1) < 1 &&
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
        STORY_D->remove_story("mengzi");//降低出现机率 2017-01-08
        STORY_D->give_gift("/clone/book/mengzi", 1,
                           HIM "\n“啪”的一声一本书掉到你面前。\n\n" NOR);
        return 1;
}
