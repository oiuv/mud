/* area_pattern_d.c
   created by Acme
*/

#include <ansi.h>
// 区域模式样式目录，可在 <globals.h> 中定义
#ifndef AREA_PATTERN_DIR
#define AREA_PATTERN_DIR    CORE_DIR "world/area_pattern/"
#endif
string *patterns = ({});

void scanPattern(string dir)
{
    string file;
    mixed *files, *dirent;

    files = get_dir(dir, -1);

    if (!sizeof(files))
    {
        if (file_size(dir) == -2)
            write("ERROR: Area_Pattern目錄是空的。 (" + dir + ")\n");
        else
            write("ERROR: 沒有這個目錄。 (" + dir + ")\n");
        return;
    }

    // write("掃瞄 Area_Pattern 中 " + dir + " ...\n\n");

    foreach (dirent in files)
    {
        file = dir + dirent[0];
        // write( sprintf("%-60s", file) );

        if (!file->isAreaPattern())
        {
            // write( " -> 非 Area_Pattern 檔.\n");
            continue;
        }

        // write(" -> OK.\n");
        patterns += ({file});
    }

    // write("\n掃瞄完成。\n\n");
}

string *getPatterns() { return patterns; }

void create()
{
    seteuid(getuid());
    scanPattern(AREA_PATTERN_DIR);
}

void listPatterns()
{
    int i, size = sizeof(patterns);

    write("編號  名稱\n");
    write("======================================================================\n");
    for (i = 0; i < size; i++)
        write(sprintf("%|4d  %s %s\n", i, patterns[i]->getName(), BLU + patterns[i] + NOR));
    write("======================================================================\n");
}

void patternInfo(int index)
{
    mapping info, style_value;
    string *style_key;
    int i, j, k, style_size;

    if (index < 0 || index >= sizeof(patterns))
        return;

    info = patterns[index]->getMapStyle();
    style_key = keys(info);
    style_size = sizeof(style_key);

    write("編號  名稱\n");
    write("======================================================================\n");
    write(sprintf("%|4d  %s %s\n", index, patterns[index]->getName(), BLU + patterns[index] + NOR));
    write("======================================================================\n\n");
    for (i = 0; i < style_size; i++)
    {
        write(style_key[i] + ":\n");
        style_value = info[style_key[i]];
        for (j = 0; j < sizeof(style_value); j++)
        {
            for (k = 0; k < sizeof(style_value[j]); k++)
            {
                write(sprintf("%2s", "" + style_value[j][k]));
            }
            write("\n");
        }
        write("\n");
    }
    write("======================================================================\n");
}

void setPattern(object who, int index)
{
    int x, y;
    mapping info, style_value;
    string *style_key;
    int i, j, k, style_size;
    object area;

    if (!objectp(who))
        return;
    if (!environment(who))
        return;
    if (!environment(who)->is_area())
        return;
    if (index < 0 || index >= sizeof(patterns))
        return;

    area = environment(who);
    x = who->query("area_info/x_axis");
    y = who->query("area_info/y_axis");

    info = patterns[index]->getMapStyle();
    style_key = keys(info);
    style_size = sizeof(style_key);

    // 設定的資料類型
    for (i = 0; i < style_size; i++)
    {
        style_value = info[style_key[i]];

        // 開始跑資料距陣
        for (j = 0; j < sizeof(style_value); j++)
        {
            for (k = 0; k < sizeof(style_value[j]); k++)
            {
                area->set_data(x + k, y + j, style_key[i], style_value[j][k]);
                write(sprintf("(%2d,%2d) %s -> %s\n", x + k, y + j, "" + style_key[i], "" + style_value[j][k]));
            }
        }
    }
}
